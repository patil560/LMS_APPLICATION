import "./setup.js";
import test from "node:test";
import assert from "node:assert/strict";

const { default: Course } = await import("../model/course.model.js");
const { default: User } = await import("../model/user.model.js");
const { Lecture } = await import("../model/lecture.model.js");
const { CoursePurchase } = await import("../model/purchaseCourse.model.js");
const { CourseProgress } = await import("../model/courseprogress.model.js");
const { isInstructor, requireEnrollment } = await import("../middleware/access.js");
const { getPublishedCourse, searchCourse, togglePublishCourse, editLecture, removeLecture, createLecture } = await import("../controller/course.controller.js");
const { getCourseDetailWithPurchasedStatus, getAllPurchasedCourse, completePurchase } = await import("../controller/coursePurchase.controller.js");
const { updateLectureProgress } = await import("../controller/courseProgress.controller.js");

const res = () => { const r = { code: 200 }; r.status = (c) => { r.code = c; return r; }; r.json = (b) => { r.body = b; return r; }; return r; };
// a fake mongoose query: every chained method returns itself, awaiting it yields `result`
const chain = (result, spy = {}) => {
  const q = new Proxy({}, { get: (_, prop) => {
    if (prop === "then") return (resolve, reject) => Promise.resolve(result).then(resolve, reject);
    return (...args) => { (spy[prop] ||= []).push(args); return q; };
  } });
  return q;
};
const ID = (n) => `${n}`.padStart(24, "0");

test("isInstructor: student gets 403, instructor passes, unknown user 401", async () => {
  let passed = 0;
  User.findById = () => chain({ role: "student" });
  let r = res(); await isInstructor({ id: ID(1) }, r, () => passed++); assert.equal(r.code, 403);
  User.findById = () => chain({ role: "instructor" });
  r = res(); await isInstructor({ id: ID(1) }, r, () => passed++); assert.equal(passed, 1);
  User.findById = () => chain(null);
  r = res(); await isInstructor({ id: ID(1) }, r, () => passed++); assert.equal(r.code, 401);
});

test("requireEnrollment: blocks strangers (the free-video hole), allows buyers and the owner", async () => {
  const run = async (course, paid, enrolled, userId = ID(5)) => {
    Course.findById = () => chain(course);
    CoursePurchase.exists = async () => paid;
    User.exists = async () => enrolled;
    const r = res(); let passed = false;
    await requireEnrollment({ params: { courseId: ID(9) }, id: userId }, r, () => { passed = true; });
    return { r, passed };
  };
  assert.equal((await run(null, null, null)).r.code, 404);
  assert.equal((await run({ creator: ID(1) }, null, null)).r.code, 403);
  assert.equal((await run({ creator: ID(1) }, { _id: 1 }, null)).passed, true);
  assert.equal((await run({ creator: ID(1) }, null, { _id: 1 })).passed, true);
  assert.equal((await run({ creator: ID(5) }, null, null)).passed, true); // owner
});

test("published list is paginated, sorted, lean and capped", async () => {
  const spy = {};
  Course.find = () => chain([{ courseTitle: "A" }], spy);
  Course.countDocuments = async () => 45;
  const r = res();
  await getPublishedCourse({ query: { page: "2", limit: "1000" } }, r);
  assert.equal(r.code, 200);
  assert.deepEqual(r.body.pagination, { page: 2, limit: 50, total: 45, totalPages: 1, hasNextPage: false, hasPrevPage: true });
  assert.deepEqual(spy.skip[0], [50]);
  assert.deepEqual(spy.limit[0], [50]);
  assert.ok(spy.lean);
});

test("search is paginated and regex-escaped", async () => {
  const spy = {}; let filter;
  Course.find = (f) => { filter = f; return chain([], spy); };
  Course.countDocuments = async () => 0;
  const r = res();
  await searchCourse({ query: { query: "c++(", page: "1" } }, r);
  assert.equal(r.code, 200);
  assert.equal(filter.$or[0].courseTitle.$regex, "c\\+\\+\\(");
  assert.ok(r.body.pagination);
});

test("course detail: visitors do not get paid video URLs and never the creator's password", async () => {
  const course = {
    _id: ID(9), creator: { _id: ID(1), name: "Teacher", photourl: "p" },
    lectures: [{ _id: ID(11), videoUrl: "https://v/free.mp4", publicId: "f", isPreviewFree: true },
               { _id: ID(12), videoUrl: "https://v/paid.mp4", publicId: "p", isPreviewFree: false }],
  };
  let populateArgs = [];
  Course.findById = () => { const spy = {}; const q = chain(JSON.parse(JSON.stringify(course)), spy); populateArgs = spy; return q; };
  CoursePurchase.exists = async () => null;
  let r = res();
  await getCourseDetailWithPurchasedStatus({ params: { courseId: ID(9) }, id: ID(5) }, r);
  assert.equal(r.body.purchased, false);
  assert.equal(r.body.course.lectures[0].videoUrl, "https://v/free.mp4");
  assert.equal(r.body.course.lectures[1].videoUrl, undefined);
  assert.equal(r.body.course.lectures[1].publicId, undefined);
  const creatorPopulate = populateArgs.populate.find((a) => a[0].path === "creator");
  assert.equal(creatorPopulate[0].select, "name photourl"); // no password hash

  CoursePurchase.exists = async () => ({ _id: 1 });
  r = res();
  await getCourseDetailWithPurchasedStatus({ params: { courseId: ID(9) }, id: ID(5) }, r);
  assert.equal(r.body.purchased, true);
  assert.equal(r.body.course.lectures[1].videoUrl, "https://v/paid.mp4");

  CoursePurchase.exists = async () => null;
  r = res();
  await getCourseDetailWithPurchasedStatus({ params: { courseId: ID(9) }, id: ID(1) }, r); // the instructor
  assert.equal(r.body.isOwner, true);
  assert.equal(r.body.purchased, true);
});

test("dashboard: totals come from the database and are limited to the instructor's courses", async () => {
  let aggMatch, findFilter;
  Course.find = () => chain([{ _id: ID(1) }, { _id: ID(2) }]);
  CoursePurchase.aggregate = async (p) => { aggMatch = p[0].$match; return [{ totalSales: 1234, totalRevenue: 98765 }]; };
  CoursePurchase.find = (f) => { findFilter = f; return chain([{ amount: 1 }]); };
  const r = res();
  await getAllPurchasedCourse({ id: ID(7) }, r);
  assert.equal(r.body.totalSales, 1234);
  assert.equal(r.body.totalRevenue, 98765);
  assert.equal(aggMatch.courseId.$in.length, 2);
  assert.equal(findFilter.status, "completed");
});

test("publish needs lectures; only the owner may publish", async () => {
  const mk = (creator, lectures) => ({ creator, lectures, isPublished: false, save: async function () {} });
  Course.findById = () => chain(mk(ID(1), []));
  let r = res(); await togglePublishCourse({ params: { courseId: ID(9) }, query: { publish: "true" }, id: ID(1) }, r);
  assert.equal(r.code, 400);
  Course.findById = () => chain(mk(ID(1), [ID(2)]));
  r = res(); await togglePublishCourse({ params: { courseId: ID(9) }, query: { publish: "true" }, id: ID(8) }, r);
  assert.equal(r.code, 403);
  r = res(); await togglePublishCourse({ params: { courseId: ID(9) }, query: { publish: "true" }, id: ID(1) }, r);
  assert.equal(r.code, 200);
});

test("lecture routes enforce ownership", async () => {
  // createLecture on someone else's course: 403 and nothing created
  let created = false;
  Course.findById = async () => ({ creator: ID(1), lectures: [], push() {}, save: async () => {} });
  Lecture.create = async () => { created = true; return {}; };
  let r = res(); await createLecture({ body: { lectureTitle: "L" }, params: { courseId: ID(9) }, id: ID(2) }, r);
  assert.equal(r.code, 403); assert.equal(created, false);

  // editLecture: lecture not part of the course -> 404 (cannot edit other instructors' lectures)
  Course.findById = async () => ({ creator: ID(2), lectures: [ID(3)] });
  r = res(); await editLecture({ body: {}, params: { courseId: ID(9), lectureId: ID(4) }, id: ID(2) }, r);
  assert.equal(r.code, 404);

  // removeLecture of a lecture in nobody-you-own's course -> 404 and nothing deleted
  let deleted = false;
  Course.findOne = async () => null;
  Lecture.findByIdAndDelete = async () => { deleted = true; return {}; };
  r = res(); await removeLecture({ params: { lectureId: ID(4) }, id: ID(2) }, r);
  assert.equal(r.code, 404); assert.equal(deleted, false);
});

test("progress: fake lecture ids are rejected", async () => {
  Course.findById = async () => ({ lectures: [ID(3)] });
  const r = res();
  await updateLectureProgress({ params: { courseId: ID(9), lectureId: ID(4) }, id: ID(1) }, r);
  assert.equal(r.code, 400);
});

test("completePurchase is idempotent", async () => {
  const saves = [];
  const purchase = { status: "pending", userId: ID(1), courseId: ID(2), save: async () => saves.push(1) };
  CoursePurchase.findOne = async () => purchase;
  User.findByIdAndUpdate = async () => {}; Course.findByIdAndUpdate = async () => {};
  assert.equal(await completePurchase({ id: "s", amount_total: 10000 }), true);
  await completePurchase({ id: "s", amount_total: 10000 });
  assert.equal(saves.length, 1);
});

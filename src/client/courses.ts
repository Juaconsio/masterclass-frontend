import type { IReservation, ICourse, ISlot, IPricingPlan } from '@/interfaces';
import { httpClient } from './config';
import buildQuery from './lib/buildQuery';

async function fetchCourses() {
  const res = await httpClient.get('courses');
  return res.data;
}

async function fetchCoursesByCurrentUser() {
  const res = await httpClient.get('/courses/me');
  return res.data;
}

async function fetchStudentCourseById(courseId: number) {
  const res = await httpClient.get(`/courses/${courseId}`);
  return res.data;
}

async function getCourseEnroll(options: {
  courseId?: number;
  courseAcronym?: string;
  slotId?: number;
}): Promise<{
  course: ICourse;
  slot: ISlot;
  reservation: IReservation;
  pricingPlans: IPricingPlan[];
}> {
  const { courseId, courseAcronym, slotId } = options;
  const query = buildQuery({
    courseId: courseId || undefined,
    courseAcronym: courseAcronym || undefined,
    slotId: slotId || undefined,
  });
  const res = await httpClient.get(`/public/courses/enroll${query ? `?${query}` : ''}`);
  return res.data;
}

async function getSlotsByCourseAcronym(acronym: string) {
  const res = await httpClient.get(`/public/courses/${acronym}/slots`);
  return res.data;
}

export {
  fetchCourses,
  fetchCoursesByCurrentUser,
  fetchStudentCourseById,
  getSlotsByCourseAcronym,
  getCourseEnroll,
};

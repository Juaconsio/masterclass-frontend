import { httpClient } from './config';

async function fetchCourses() {
  const res = await httpClient.get('/courses');
  return res.data;
}

async function createCourse(payload: any) {
  const res = await httpClient.post('/courses', payload);
  return res.data;
}

async function updateCourse(payload: any) {
  const res = await httpClient.put('/courses', payload);
  return res.data;
}

async function deleteCourse() {
  const res = await httpClient.delete('/courses');
  return res.data;
}

export { fetchCourses, createCourse, updateCourse, deleteCourse };

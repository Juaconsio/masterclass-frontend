import React, { createContext, useCallback, useContext, useState } from 'react';

export interface BreadCrumbCourse {
  id: number;
  acronym: string;
  title: string;
}

export interface BreadCrumbClass {
  id: number;
  title: string;
}

interface BreadCrumbRouteValue {
  course: BreadCrumbCourse | null;
  class: BreadCrumbClass | null;
  setBreadCrumbRoute: (course: BreadCrumbCourse | null, classItem: BreadCrumbClass | null) => void;
}

const BreadCrumbRouteContext = createContext<BreadCrumbRouteValue | null>(null);

export function BreadCrumbRouteProvider({ children }: { children: React.ReactNode }) {
  const [course, setCourse] = useState<BreadCrumbCourse | null>(null);
  const [classItem, setClassItem] = useState<BreadCrumbClass | null>(null);

  const setBreadCrumbRoute = useCallback(
    (c: BreadCrumbCourse | null, cl: BreadCrumbClass | null) => {
      setCourse(c);
      setClassItem(cl);
    },
    []
  );

  const value: BreadCrumbRouteValue = {
    course,
    class: classItem,
    setBreadCrumbRoute,
  };

  return (
    <BreadCrumbRouteContext.Provider value={value}>
      {children}
    </BreadCrumbRouteContext.Provider>
  );
}

export function useBreadCrumbRoute() {
  const ctx = useContext(BreadCrumbRouteContext);
  return ctx;
}

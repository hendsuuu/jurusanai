import { NextResponse } from "next/server";

export type ApiSuccess<T> = {
  success: true;
  message: string;
  data: T;
};

export type ApiError = {
  success: false;
  message: string;
  errors?: unknown;
};

export function ok<T>(data: T, message = "OK", status = 200) {
  return NextResponse.json<ApiSuccess<T>>(
    {
      success: true,
      message,
      data,
    },
    { status }
  );
}

export function fail(
  message = "Something went wrong",
  status = 500,
  errors?: unknown
) {
  return NextResponse.json<ApiError>(
    {
      success: false,
      message,
      errors,
    },
    { status }
  );
}

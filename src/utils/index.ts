import { Exception } from "@tsed/exceptions"
import { DuplicateEntry } from "src/exceptions/DuplicateEntry"
import { EntryNotFound } from "src/exceptions/EntryNotFound"
import { EnvVarException } from "src/exceptions/EnvVarException"
import { MalformedGuid } from "src/exceptions/MalformedGuid"
import { SignedAuthenticationJWTData } from "src/models/Auth"
import { ErrorResponseProperties } from "src/models/ErrorResponse"
import { SuccessResponse, SuccessResponseProperties } from "src/models/SuccessResponse"
import jwt from "jsonwebtoken";

export const convertLocalDateToUTCDate = (date: Date) => {
  return new Date(
    date.getUTCFullYear(),
    date.getUTCMonth(),
    date.getUTCDate(),
    date.getUTCHours(),
    date.getUTCMinutes(),
    date.getUTCSeconds(),
    date.getUTCMilliseconds(),
  )
}

export const throwErrorResponse = <T>(errorResponse: ErrorResponseProperties<T>) => {
  let error;
  switch (errorResponse.exceptionType) {
    case "DuplicateEntry": 
      error = new DuplicateEntry(errorResponse)
    break;
    case "EntryNotFound": 
      error = new EntryNotFound(errorResponse)
    break;
    case "EnvVarException": 
      error = new EnvVarException(errorResponse)
    break;
    case "MalformedGuid": 
      error = new MalformedGuid(errorResponse)
    break;
    default: 
      error = new Exception(400)
  }
  error.apiResult = {...errorResponse, responseResult: "error"}
  throw error
}

export const returnSuccessResponse = <T>(successResponse: SuccessResponseProperties<T>): SuccessResponse<T> => {
  return { apiResult: { ...successResponse, responseResult: successResponse.responseResult ?? "success"} }
}

export const getRequesterAccountUID = (authorization: string | undefined) => {
  if (!authorization) {
    return throwErrorResponse({
      code: "e-auth-0002",
      message: "Autorización no encontrada.",
      status: 400,
      value: null,
      exceptionType: "MalformedGuid"
    })
  }
  if (!process.env.JWT_SECRET) {
    return throwErrorResponse({
      code: "e-account-0005",
      message: "No se pudo determinar las credenciales.",
      status: 400,
      value: null,
      exceptionType: "EnvVarException"
    })
  }
  const { signedData }: SignedAuthenticationJWTData = jwt.verify(authorization, process.env.JWT_SECRET) as SignedAuthenticationJWTData || {}
  if (!signedData) {
    return throwErrorResponse({
      code: "e-account-0005",
      message: "No se pudo verificar las credenciales.",
      status: 400,
      value: null,
      exceptionType: "EnvVarException"
    })
  }
  return signedData.accountId
}

export const isValueNullUndefinedOrEmpty = (value: unknown) =>  {
  return value === undefined || value === "undefined" || value === null || value == "null" || value === ""
}

export const isObjectOrArrayEmpty = (obj: any) =>
	[Object, Array].includes((obj || {}).constructor) && !Object.entries(obj || {}).length;

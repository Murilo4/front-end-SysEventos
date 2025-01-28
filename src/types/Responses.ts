export type SuccessResponse = {
    success: true
    message: string
  }
  
  export type ErrorResponse = {
    success: false
    error: string[]
  }
  
  export type SuccessResponseWithJwtToken = SuccessResponse & {
    jwt_token: string
  }
  
  export type SuccessWithUserData = SuccessResponse & {
    email: string
  }
  
  export type SuccessWithUserCredentials = {
    success: true
    user: User
  }
  
  export type SuccessWithSessionTokenResponse = SuccessResponse & {
    cookie: string
    Authorization: string
    email: string
  }
  
  export type VerifySessionType = (
    session: string,
  ) => Promise<SuccessResponse | ErrorResponse>
  
  export type SuccessResponseWithLink = SuccessResponse & {
    link: string
  }
  
  export type SendUserPhotoInFirebaseType = (
    image: File,
    path: string,
  ) => Promise<ErrorResponse | SuccessResponseWithLink>
  
  export type SuccessResponseWithAllLinks = SuccessResponse & {
    links: string[]
  }
  
  export type SendManyUserPhotosInFirebaseType = (
    image: File[],
    path: string,
  ) => Promise<ErrorResponse | SuccessResponseWithAllLinks>
  
  export type UserLogOutType = (
    session: string,
    jwtToken: string,
  ) => Promise<ErrorResponse | SuccessResponse>
//Nothing happening here

import { prjCloudLogError } from 'DWcmn/prjCloudLog'

let hasLoggedStubRender = false

export function signinApple() {
   if (!hasLoggedStubRender) {
      hasLoggedStubRender = true
      //CLAUDE see note above
      prjCloudLogError('signinApple', 'android stub rendered - Apple button call site is missing its Platform.OS guard', { toast: false })
   }
   return null
}
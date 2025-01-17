const asyncHandler = (requestHandler) => {
     (req, res, next) => {
      // Call the async handler and catch any errors
      Promise.resolve(requestHandler(req, res, next)).catch((err)=>next(err))
    };
  };
  
  export { asyncHandler };


  // const asyncHandler=(fn)=>async(req,res,next)=>{
    // try{ await fn(req,res,next)
    //}
    //catch(err)
  //  {
       //err
   // }
//}
  
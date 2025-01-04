# Cron-Job-API

This is a Back-End project for creating Cron Job API that processes
Subscription Payment. This API runs every 24 hours to process user subscription payments based on the user’s status. It Checks for users whose trial plans have expired (planEndDate is in the past). If a user's status is active, the API charges them $97 using Authorize.net sdk. Payment details (card number, CVC, expiry date) are stored in the user schema. Besides, it logs the payment success or failure and updates the subscription status accordingly.



**The stacks and tools used in this project are described below:**
- Node.js + Express.js + Mongoose
-  This project was developed using Node.js-based express.js Framework using mongoose ODM.
-  Used node-cron to schedule the job.
-  Integrated with Authorize.net for payment processing.
-  Personal API Login ID and Transaction key of authorize.net sandbox account was used to utilize the payment gateway.
-  Used Postman for testing the API with mongodb database that was created based on a given schema.
-  Implemented JWT Bearer Token as middleware for authentication.
-  Ensured proper error handling and logging of payment outcomes.

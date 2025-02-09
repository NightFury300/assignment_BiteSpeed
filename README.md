# BiteSpeed Identity Reconciliator

This is a server-side application built with Node.js. The application is built to identify and keep track of a customer's identity across multiple purchases.
## Features
- **Create Contact**: If a request made has no links to existing customers it is treated as new Customer Contact information.
- **Fetch Links Between Contact**: If the request is linked to an existing customer, primary contact and all secondary contact information is fetched from the Database.
- **Create New Links**: If request links two different customers togehther, they are linked togehther and the oldest information is marked as primary.

## Tech Stack
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Sequelize)

## Live Hosting
The web service is hosted and running on render.com. Inaccessible using browser, because there is only one API Endpoint as listed below. The URL is-
`https://bitespeed-juom.onrender.com`

## API Endpoints

### 1. /identify
- **Full API URL**: `https://bitespeed-juom.onrender.com/identify`
- **Method**: `POST`
- **Description**: Fetches existing customer based on the data provided, if not any, creates new Customer and merges links if needed.
- **JSON Body**:
``` bash
  {
    "email"?: string,
    "phoneNumber"?: number
  }
```
  
- **Sample Request**:
``` json
    {
      "phoneNumber": "123",
      "email": "mcfly@hillvalley.edu"
    }
```

- **Sample Response**:
    ``` json
    {
    "statusCode": 200,
    "data": {
        "contact": {
            "primaryContactId": 1,
            "emails": [
                "mcfly@hillvalley.edu",
                "lorraine@hillvalley.edu"
            ],
            "phoneNumbers": [
                "123456",
                "123"
            ],
            "secondaryContactIds": [
                2,
                22
            ]
        }
    },
    "message": "Links Fetched Successfully.",
    "success": true
    }
``

## How to Set Up Locally

1. Clone the repository:
    ```bash
    git clone https://github.com/NightFury300/assignment_BiteSpeed.git
    ```
2. Change Directory and Install dependencies:
    ```bash
    cd assignment_BiteSpeed
    npm install
    ```
3. Set up the DB URI in `.env` file.
4. Start the server:
    ```bash
    npm run dev
    ```
5. The API will be available at `http://localhost:3000/`.

## Acknowledgments

Thank you for checking out the BiteSpeed Identity Reconciliator! For any inquiries or feedback, feel free to reach out to me at [shubhsaxena447@gmail.com](mailto:shubhsaxena447@gmail.com).

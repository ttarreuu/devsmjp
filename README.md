# SMJP

![TypeScript](https://img.shields.io/badge/-TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)
![Kotlin](https://img.shields.io/badge/-Kotlin-0095D5?style=for-the-badge&logo=kotlin&logoColor=white)
![React Native](https://img.shields.io/badge/-React%20Native-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)
![Realm](https://img.shields.io/badge/-Realm-39477F?style=for-the-badge&logo=realm&logoColor=white)
![Mapbox](https://img.shields.io/badge/-Mapbox-4264FB?style=for-the-badge&logo=mapbox&logoColor=white)



SMJP is an Android-based application developed for security personnel working in refinery areas to enhance work efficiency and effectiveness. The app is fully functional offline and includes features such as attendance tracking, patrol logging, user collaboration, and location tracking. It has been designed to support security operations in challenging environments, especially with limited or no internet connectivity.

## Tech Stack
- **React Native**: Cross-platform mobile app development framework.
- **Mapbox**: For satellite map visualizations and location tracking.
- **Realm DB**: Local database for offline data storage.
- **NFC and QR Code Scanner**: For security and identification purposes.

## Features
- **Attendance Tracking**: Log attendance of security personnel.
- **Patrol Logging**: Record patrol activities and route tracking.
- **User Collaboration**: Enable multiple users to collaborate within the app.
- **Location Tracking**: Real-time location tracking using Mapbox.
- **Offline Support**: Works seamlessly without an internet connection using Realm DB for local data storage.
- **NFC & QR Code Scanner**: Scan codes for enhanced security and identification.

## Installation

### Prerequisites
- **Node.js** (v12 or later)
- **npm** or **yarn** package manager
- **React Native CLI** installed
- Android device running Android 9.0 or higher.

### Steps
1. Clone the repository:
    ```bash
    git clone https://github.com/ttarreuu/devsmjp.git
    ```

2. Install dependencies:
    ```bash
    cd devsmjp
    npm install
    ```

3. Run the app on an Android emulator or device:
    ```bash
    npx react-native run-android
    ```

## Usage

Once the app is installed, it can be used by security personnel to:
- Log attendance and patrol activities.
- Collaborate with other users in the app.
- View real-time location on the Mapbox-powered map.
- Function offline in remote areas, saving data locally.

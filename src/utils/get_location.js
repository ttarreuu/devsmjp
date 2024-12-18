const getLocation = () => {
    Geolocation.getCurrentPosition(
        position => {
        const lat = position.coords.latitude;
        const long = position.coords.longitude;
        console.log(lat, long);
      },
      error => {
          console.log(error.code, error.message);
      },
      {
          enableHighAccuracy: true,  
      }
    );
};

  export default getLocation;
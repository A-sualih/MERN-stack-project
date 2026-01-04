import React, { useEffect, useState } from "react";
import PlaceList from "../components/PlaceList";
import { useParams } from "react-router-dom";
import { useHttpClient } from "../../shared/hooks/http-hook";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";

const UserPlaces = () => {
  const [loadedPlaces, setLoadedPlaces] = useState();
  const { userId } = useParams();
  const { isLoading, error, sendRequest, clearError } = useHttpClient();

  useEffect(() => {
    const fetchPlaces = async () => {
      try {
        const responseData = await sendRequest(
<<<<<<< HEAD
<<<<<<< HEAD
          `${process.env.REACT_APP_BACKEND_URL}/api/places/user/${userId}`
=======
             `${process.env.REACT_APP_BACKEND_URL}/places/${userId}`
>>>>>>> 982d02b190fb7804b5f5a1ec5134ecf1fe0037da
=======
          `${import.meta.env.VITE_BACKEND_URL}/places/user/${userId}`
>>>>>>> 55dc9d8a0a31d4443dfcaf7321c1a26b66355ba9
        );
        setLoadedPlaces(responseData.places);
      } catch (err) { }
    };
    fetchPlaces();
  }, [sendRequest, userId]);

  const placeDeletedHandler = (deletedPlaceId) => {
    setLoadedPlaces(prevPlaces =>
      prevPlaces.filter(place => place.id !== deletedPlaceId)
    );
  };

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      {isLoading && (
        <div className="center">
          <LoadingSpinner />
        </div>
      )}
      {!isLoading && loadedPlaces && (
        <PlaceList
          items={loadedPlaces}
          onDeletePlace={placeDeletedHandler}
        />
      )}
    </React.Fragment>
  );
};

export default UserPlaces;

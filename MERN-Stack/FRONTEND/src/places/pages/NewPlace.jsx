import React, { useCallback, useReducer, useContext } from "react";
import "./PlaceForm.css";
import {
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import Input from "../../shared/components/FormElements/Input";
import Button from "../../shared/components/FormElements/Button";
import { useForm } from "../../shared/hooks/form-hook";
import { AuthContext } from "../../shared/context/auth-context";
import { useHttpClient } from "../../shared/hooks/http-hook";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import ImageUploade from '../../shared/components/FormElements/ImageUploade'
    import { useNavigate } from "react-router-dom";
// Reducer for form state

const NewPlace = () => {
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const auth = useContext(AuthContext);
  const [formState, inputHandler] = useForm(
    {
      title: { value: "", isValid: false },
      description: { value: "", isValid: false },
      address: { value: "", isValid: false },
      image:{
        value:null,
        isValid:false,
      }
    },
    false
  );
const navigate = useNavigate();
  // Handle form submission
 const placeSubmitHandler = async (event) => {
  event.preventDefault();

  try {
    const formData = new FormData();
    formData.append("title", formState.inputs.title.value);
    formData.append("description", formState.inputs.description.value);
    formData.append("address", formState.inputs.address.value); // ✅ FIXED
    formData.append("creator", auth.userId);
    formData.append("image", formState.inputs.image.value);

    await sendRequest(
      "http://localhost:5001/api/places",
      "POST",
      formData,
      {
        Authorization: "Bearer " + auth.token // ✅ if auth enabled
      }
    );

    navigate("/");
  } catch (err) {}
};

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError}/>
    <form className="place-form" onSubmit={placeSubmitHandler}>
      {isLoading && <LoadingSpinner asOverlay/> }
      <Input
        id="title"
        element="input"
        type="text"
        label="Title"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid title."
        onInput={inputHandler}
      />
      <Input
        id="description"
        element="textarea"
        label="Description"
        validators={[VALIDATOR_MINLENGTH(5)]}
        errorText="Please enter a valid description (min. 5 characters)."
        onInput={inputHandler}
      />
      <Input
        id="address"
        element="input"
        label="Address"
        validators={[VALIDATOR_REQUIRE()]}
        errorText="Please enter a valid address."
        onInput={inputHandler}
      />
      <ImageUploade id="image" onInput={inputHandler} errorText="Please provide an image"/>
      <Button type="submit" disabled={!formState.isValid}>
        ADD PLACE
      </Button>
    </form>
    </React.Fragment>
  );
};
export default NewPlace;

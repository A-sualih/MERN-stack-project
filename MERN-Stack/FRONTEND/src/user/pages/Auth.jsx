import React, { useContext, useState } from "react";
import Card from "../../shared/components/UIElement/Card";
import Input from "../../shared/components/FormElements/Input";
import ImageUploade from "../../shared/components/FormElements/ImageUploade";
import {
  VALIDATOR_EMAIL,
  VALIDATOR_MINLENGTH,
  VALIDATOR_REQUIRE,
} from "../../shared/util/validators";
import "./Auth.css";
import { useForm } from "../../shared/hooks/form-hook";
import Button from "../../shared/components/FormElements/Button";
import { AuthContext } from "../../shared/context/auth-context";
import ErrorModal from "../../shared/components/UIElement/ErrorModal";
import LoadingSpinner from "../../shared/components/UIElement/LoadingSpinner";
import { useHttpClient } from "../../shared/hooks/http-hook";
const Auth = () => {
  const auth = useContext(AuthContext);
  const [isLogin, setIsLogin] = useState(true);
  // const [isLoading,setIsLoading]=useState(false);
  // const [error,setError]=useState(false)
  const { isLoading, error, sendRequest, clearError } = useHttpClient();
  const [formState, inputHandler, setFromData] = useForm(
    {
      email: {
        value: "",
        isValid: false,
      },
      password: {
        value: "",
        isValid: false,
      },
    },
    false
  );
  const authSubmitHandler = async (event) => {
    event.preventDefault();
    console.log(formState.inputs)
    if (isLogin) {
      // setIsLoading(true)
      try {
        const responseData = await sendRequest(
          "http://localhost:5001/api/users/login",
          "POST",
          JSON.stringify({
            email: formState.inputs.email.value,
            password: formState.inputs.password.value,
          }),
          {
            "Content-Type": "application/json",
          }
        );

        console.log(responseData);

        auth.login(responseData.userId,responseData.token);
      } catch (error) {
        console.log(error);
      }
    } else {
      try {
        const formData=new FormData();
        formData.append("email",formState.inputs.email.value);
        formData.append("name",formState.inputs.name.value);
        formData.append("password",formState.inputs.password.value);
        formData.append('image',formState.inputs.image.value)
        const responseData = await sendRequest(
          "http://localhost:5001/api/users/signup",
          "POST",
        formData,
          // JSON.stringify({
          //   name: formState.inputs.name.value,
          //   email: formState.inputs.email.value,
          //   password: formState.inputs.password.value,
          // }),
          // {
          //   "Content-Type": "application/json",
          // }
        );

        auth.login(responseData.userId,responseData.token);
        console.log(responseData);
      } catch (error) {
        console.log(error);
        // setIsLoading(false);
        // setError(error.message || "Something went wrong , please try again")
        // console.log(error.message || "Signup failed.");
      }
    }
  };
  const switchModeHandler = () => {
    if (!isLogin) {
      setFromData(
        {
          ...formState.inputs,
          name: undefined,
          image:undefined
        },
        formState.inputs.email.isValid && formState.inputs.password.isValid
      );
    } else {
      setFromData(
        {
          ...formState.inputs,
          name: {
            value: "",
            isValid: false,
            image:{
          value:null,
          isValid:false
            }
          },
        },
        false
      );
    }
    setIsLogin((prevMode) => !prevMode);
  };
  // const errorHandler=()=>{
  //   clearError()
  // }

  return (
    <React.Fragment>
      <ErrorModal error={error} onClear={clearError} />
      <Card className="authentication">
        {isLoading && <LoadingSpinner asOverlay />}
        <h2>Login Required</h2>
        <hr />
        <form onSubmit={authSubmitHandler}>
          {!isLogin && (
            <Input
              element="input"
              id="name"
              type="text"
              label="Your Name"
              validators={[VALIDATOR_REQUIRE()]}
              errorText="please enter a name"
              onInput={inputHandler}
            />
          )}

          {!isLogin && <ImageUploade center id="image" onInput={inputHandler}/>}
          <Input
            element="input"
            id="email"
            type="email"
            label="E-mail"
            validators={[VALIDATOR_EMAIL()]}
            errorText="Please enter a valid email address"
            onInput={inputHandler}
          />
          <Input
            element="input"
            id="password"
            type="password"
            label="password"
            validators={[VALIDATOR_MINLENGTH(5)]}
            errorText="Please enter a valid password "
            onInput={inputHandler}
          />
          <Button type="submit" disabled={!formState.isValid}>
            {isLogin ? "LOGIN" : "SIGNUP"}
          </Button>
        </form>
        <Button inverse onClick={switchModeHandler}>
          SWITCH TO {isLogin ? "SIGNUP" : "LOGIN"}
        </Button>
      </Card>
    </React.Fragment>
  );
};

export default Auth;

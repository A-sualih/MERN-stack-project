import React, { useEffect, useRef, useState } from "react";
import "./ImageUpload.css";
import Button from "./Button";
const ImageUploade = (props) => {
  const [file, setFile] = useState()
  const [previewUrl, setPreviwUrl] = useState(false)
  const [isValid, setIsValid] = useState(false)
  const [isTouched, setIsTouched] = useState(false); // Add touched state
  const filePickRef = useRef(false);
  useEffect(() => {
    if (!file) {
      return;
    }
    const fileReader = new FileReader();
    fileReader.onload = () => {
      setPreviwUrl(fileReader.result);
    }
    fileReader.readAsDataURL(file)
  }, [file])
  const PickImageHandler = () => {
    filePickRef.current.click();
  };
  const pickHandler = (event) => {
    setIsTouched(true); // Mark as touched on pick attempt
    let pickedFile;
    let fileIsValid = false;

    if (event.target.files && event.target.files.length === 1) {
      pickedFile = event.target.files[0];
      setFile(pickedFile);
      setIsValid(true);
      fileIsValid = true;
    } else {
      setIsValid(false);
    }

    props.onInput(props.id, pickedFile, fileIsValid);
  };

  return (
    <div className="form-control">
      <input
        ref={filePickRef}
        id={props.id}
        style={{ display: "none" }}
        type="file"
        accept=".jpg,.png,.jpeg"
        onChange={pickHandler}
      />
      <div className={`image-upload${props.center && "center"}`}>
        <div className="image-upload__preview">
          {previewUrl && <img src={previewUrl} alt="preview" />}
          {!previewUrl && <p>Please pick an Image</p>}
        </div>
        <Button type="button" onClick={PickImageHandler}>
          PICK IMAGE
        </Button>
      </div>
      {!isValid && isTouched && <p>{props.errorText}</p>}
    </div>
  );
};
export default ImageUploade;

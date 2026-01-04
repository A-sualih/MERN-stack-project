import React from "react";
import { Link } from "react-router-dom";
import Avatar from "../../shared/components/UIElement/Avatar";
import "./UserItem.css";
import Card from "../../shared/components/UIElement/Card";
const UserItem = (props) => {
  let image = props.image;
  if (image && !image.startsWith('http')) {
    const assetUrl = import.meta.env.VITE_ASSET_URL;
    const cleanImage = image.replace(/\\/g, "/");
    // Prevent duplication if assetUrl already includes uploads/images and image also starts with it
    if (assetUrl.includes("uploads/images") && cleanImage.startsWith("uploads/images")) {
      image = `${assetUrl}/${cleanImage.replace("uploads/images/", "")}`;
    } else {
      image = `${assetUrl}/${cleanImage}`;
    }
  }
  return (
    <div>
      <li className="user-item">
        <Card className="user-item__content">
          <Link to={`/${props.id}/places`}>
            <div className="user-item__image">
              <Avatar image={image} alt={props.name} />
            </div>
            <div className="user-item__info">
              <h2>{props.name}</h2>
              <h3>{props.placeCount} {props.placeCount === 1 ? "place" : "Places"}</h3>
            </div>
          </Link>
        </Card>

      </li>
    </div>
  );
};

export default UserItem;

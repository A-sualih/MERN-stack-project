import React from "react";
import "./UserList.jsx";
import Card from "../../shared/components/UIElement/Card.jsx";
import UserItem from "./UserItem";
const UserList = (props) => {
  if (props.items.length === 0) {
    return (
      <div className="center">
        <Card>
        <h2>No users Found</h2>
        </Card>
      </div>
    );
  }
  return (
    <div>
      <ul className="users-list">
        {props.items.map((user) => {
          return (
            <UserItem
              key={user.id}
              id={user.id}
              image={user.image}
              name={user.name}
              placeCount={user.places.length}
            />
          );
        })}
      </ul>
    </div>
  );
};
export default UserList;

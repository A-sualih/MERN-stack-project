import React from 'react'
import './PlaceList.css'
import Card from '../../shared/components/UIElement/Card'
import Button from '../../shared/components/FormElements/Button'
import PlaceItem from './PlaceItem'
const PlaceList = (props) => {
    if(props.items.length===0){
        return (
            <div className='place-list center'>
            <Card>
                <h2> No Places found. Maybe Create one?</h2>
                <Button to="/places/new">Share Place</Button>
            </Card>
            </div>
        )
    }
  return (
    <div>
      <ul className='place-list'>
        {props.items.map(place=> <PlaceItem 
        key={place.id}
        id={place.id}
        image={place.image}
        title={place.title}
        description={place.description}
        address={place.address}
        creatorId={place.creator}
        coordinates={place.location}
        onDelete={props.onDeletePlace}

        />)}
      </ul>
    </div>
  )
}

export default PlaceList

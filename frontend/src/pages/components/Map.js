import React from 'react';
import axios from 'axios';
import centroid from '@turf/centroid';
import mapboxgl from '!mapbox-gl';
import Card from '@material-ui/core/Card';
import CardContent from '@material-ui/core/CardContent';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import Collapse from '@material-ui/core/Collapse';
import ExpandLess from '@material-ui/icons/ExpandLess';
import ExpandMore from '@material-ui/icons/ExpandMore';
import { useTranslation } from 'react-i18next';
import 'mapbox-gl/dist/mapbox-gl.css';

import neighborhoodSource from '../../data/neighborhoods';
import '../index.css';
import Form from './Form';
import logo from '../../images/julia1.jpg';
import LanguageMenu from './LanguageMenu';
  
mapboxgl.accessToken = process.env.GATSBY_MAPBOX_ACCESS_TOKEN;
const backend_url = process.env.BACKEND_URL;
export default class Map extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            organizationData: null,
            dataLoaded: false,
            lng: -71.073,
            lat: 42.319,
            zoom: 11
        };
        this.updateInformation = this.updateInformation.bind(this);
    }

    async componentDidMount() {
        const res = await axios.get(backend_url + "/listAllLocations");
        const organization_data = res.data;
        // console.log(organization_data);
        
        // const bostonZipCodes = ["02128", "02126", "02136", "02122", "02124", "02121", "02125", "02131", "02119", "02120", "02132", "02111", "02118", "02130", "02127", "02210", "02163", "02134", "02135", "02129", "02108", "02114", "02116", "02199", "02222", "02109", "02110", "02113", "02115", "02215"]
                
        const { lng, lat, zoom } = this.state;
        
        // Create mapbox map
        var map = new mapboxgl.Map({
            container: 'map',
            style: 'mapbox://styles/jkym2/ckni1o0zu06zh17qigui0dmuv',
            center: [lng, lat],
            zoom: zoom
        });

        // When map loads, add neighborhood layer data from source and add layer to map
        map.on('load', function () {
            map.addSource('neighborhoods', {
                'type': 'geojson', data: neighborhoodSource
            });

            //
            map.addLayer({
                'id': 'neighborhoods-layer',
                'type': 'fill',
                'source': 'neighborhoods', // reference the data source
                'layout': {},
                'paint': {
                    'fill-color': '#0080ff', // blue color fill
                    'fill-opacity': 0.5
                }
            });
                // Add a black outline around the polygon.
            map.addLayer({
                'id': 'outline',
                'type': 'line',
                'source': 'neighborhoods',
                'layout': {},
                'paint': {
                    'line-color': '#000',
                    'line-width': 3
                }
            });

            var popup = new mapboxgl.Popup({
                closeButton: false,
                closeOnClick: false
            });

            map.on('click', 'neighborhoods-layer', function (event) { // callback function on mouse event

                const coordinates = centroid(event.features[0]).geometry.coordinates;
                const properties = event.features[0].properties;

                document.getElementById(`neighborhood-${properties.Neighborhood_ID}`).scrollIntoView();
                document.getElementById(`neighborhood-${properties.Neighborhood_ID}`).click();
                
                map.flyTo({
                    center: coordinates,
                    essential: true, // this animation is considered essential with respect to prefers-reduced-motion
                    zoom: 12.5
                });

                while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                popup
                    .setLngLat(coordinates)
                    .setHTML(`<h3>${properties.Name}</h3>`)
                    .addTo(map);
            });


            // Change the cursor to a pointer when the mouse is over the states layer.
            map.on('mouseenter', 'neighborhoods-layer', function (event) {
                map.getCanvas().style.cursor = 'pointer';

                const coordinates = centroid(event.features[0]).geometry.coordinates;
                const properties = event.features[0].properties;

                while (Math.abs(event.lngLat.lng - coordinates[0]) > 180) {
                    coordinates[0] += event.lngLat.lng > coordinates[0] ? 360 : -360;
                }
                
                popup
                    .setLngLat(coordinates)
                    .setHTML(`<h3>${properties.Name}</h3>`)
                    .addTo(map);
            });
                
            // Change it back to a pointer when it leaves.
            map.on('mouseleave', 'neighborhoods-layer', function () {
                map.getCanvas().style.cursor = '';
                popup.remove();
            });
        });
        this.setState({
            organizationData: organization_data,
            dataLoaded: true,
        })    
    }

    async updateInformation() {
        const res = await axios.get(backend_url + "/listAllLocations");
        const organization_data = res.data;
        this.setState({
            organizationData: organization_data,
            dataLoaded: true,
        })   
    }

    render() {
        return (
            <div className="main-container">
                <div className='sidebar'>
                    <div className='languageMenu' style={{display: "flex", flexDirection: "row"}}>
                        <LanguageMenu />
                    </div>
                    <div className='heading'>
                        <div style={{display: "flex", flexDirection: "row", justifyContent: "space-evenly", alignItems: "center" }}>
                            <img className="logo" src={logo} style={{paddingRight: "20px"}}></img>
                            <h2>Boston Mutual Aid</h2>
                        </div>
                        
                        <Form parentCallback={this.updateInformation}/>
                    </div>
                    
                    <div className="neighborhoods">
                        {this.state.dataLoaded ? 
                            <Neighborhoods neighborhoodData={neighborhoodSource} orgData={this.state.organizationData}></Neighborhoods> :
                            false
                        }
                    </div>
                </div>
                <div className="map" id="map"></div>
            </div>
        );
    }
}



function Neighborhoods (props) {
    const neighborhoodData = props.neighborhoodData;
    // console.log(neighborhoodData);
    
    const neighborhoodNames =  neighborhoodData.features.map((neighborhood) => {
        return neighborhood.properties.Name;
    });
    
    // console.log(d);
    neighborhoodNames.sort();
    // add Boston-wide to the front of the array
    neighborhoodNames.unshift('Boston-wide');

    const neighborhoods = [];
    neighborhoodNames.forEach(name => {
        // Boston-wide is a special case because it is not a neighborhood name
        // the organizations in Boston-wide does not belong to a single neighborhood
        if (name === "Boston-wide") {
            const orgs = props.orgData.filter(i => {
                return i.neighborhood.includes(name);
            });
            const bostonWide = {
                Name: name,
                orgs: orgs,
            }
            neighborhoods.push(bostonWide);
        } else {
            // grab neighborhood properties
            const neighborhoodProps = neighborhoodData.features.find(n => {
                return n.properties.Name === name;
            }).properties;

            const orgs = props.orgData.filter(i => {
                return i.neighborhood.includes(name);
            });

            const nbh = {
                Name: name, 
                Neighborhood_ID: neighborhoodProps.Neighborhood_ID,
                orgs: orgs
            }
            neighborhoods.push(nbh);
        }
    });

    return (
        <List
            component="div"
            className="neighborhoods"
            id="neighborhoods"
        >
            {neighborhoods.map((neighborhood) => {
                return (<Neighborhood key={`neighborhood-${neighborhood.Neighborhood_ID}`} neighborhood={neighborhood} orgs={neighborhood.orgs}/>);
            })}
        </List>
    );
}

function Neighborhood(props) {

    const { t } = useTranslation('translation');
    // create component state(open) and state update method(setOpen)
    const [open, setOpen] = React.useState(true);

    // wrap the setOpen function with handleClick function
    const handleClick = () => {
      setOpen(!open);
    };

    return (
      <div>
        <ListItem button onClick={handleClick} id={`neighborhood-${props.neighborhood.Name === "Boston-wide" ? 0 : props.neighborhood.Neighborhood_ID }`}>
          <ListItemText><h5>{t(props.neighborhood.Name)}</h5></ListItemText>
          {open ? <ExpandMore /> : <ExpandLess />}
        </ListItem>
  
        <Collapse in={!open} timeout="auto" unmountOnExit>
          {props.orgs.length !== 0 ? (props.orgs.map((org) => {
            return(
              <ListItem key={`org-${org.id}`}>
                <Organization key={`org-${org.name}`} neighborhood={props.neighborhood.Name} org={org} />
              </ListItem>);
            })): 

            (<ListItem>
              <ListItemText secondary="No organizations"></ListItemText>
            </ListItem>)}
        </Collapse>
      </div>
    );
  }
  
  function Organization(props) {
      const org = props.org;
      const { t } = useTranslation('translation');
  
      return(
        <Card className="organization">
          <CardContent className="organization-info">
            <h5>{org.name}</h5>
            <p>{t(props.neighborhood)}</p>
            {org.email !== "" ? (<p>{org.email}</p>) : false}
            {org.phone !== "" ? (<p>{org.phone}</p>)  : false}
          </CardContent>
  
          <CardContent className="organization-links">
            {org.tags[0] === "food" ? <p>Food</p> : false}
            {org.website !== "" ? (<a href={org.website}>{t('website')}</a>)  : false}
            {org.give_help !== "" ? (<a href={org.give_help}>{t('give_help')}</a>)  : false}
            {org.need_help !== "" ? (<a href={org.need_help}>{t('get_help')}</a>)  : false}
          </CardContent>
        </Card>
      )
  }
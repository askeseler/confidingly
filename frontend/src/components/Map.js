import React, { Component } from "react";
import './Map.css'; // Importing the CSS file for styles
import mapIcon from '../icons/map.svg'; // Adjust the path to your map icon
import satelliteIcon from '../icons/satellite.svg'; // Adjust the path to your satellite icon


class TileMap extends Component {
  constructor(props) {
    super(props);

    const n_tiles_pad = 2;
    let tile_cluster_width = 256 * (2 * n_tiles_pad + 1);
    let tile_cluster_height = 256 * (2 * n_tiles_pad + 1);
    let canvas_width = document.clientWidth;
    let canvas_height = document.clientHeight * .5;

    const shiftX = -(tile_cluster_width - canvas_width) / 2;
    const shiftY = -(tile_cluster_height - canvas_height) / 2;

    this.lock_fetch = false;
    this.state = {
        latitude: 48.8584, //52.52, //,
        longitude: 2.294694, //13.405
        zoom: 15,
        tiles: [],
        dragging: false,
        dragStartX: 0,
        dragStartY: 0,
        offsetX: 0, // Offset due to current drag
        offsetY: 0,
        initialShiftX: shiftX, //such that center tile is in center of canvas
        initialShiftY: shiftY,
        shiftX: shiftX, // Previous and initial shift
        shiftY: shiftY,
        n_tiles_pad: n_tiles_pad,
        canvas_width: canvas_width,
        canvas_height: canvas_height,
        tile_cluster_width: tile_cluster_width,
        tile_cluster_height: tile_cluster_height,
        centerTileX: 10000, //132742,
        centerTileY: 89700, //90183,
        mapStyle: "map",
    };
  

  this.handleChange = this.handleChange.bind(this);
  this.handleSearchClick = this.handleSearchClick.bind(this);
  this.toggleMapStyle = this.toggleMapStyle.bind(this);
   }

  toggleMapStyle = () => {
        this.setState(prevState => {
            const newMapStyle = prevState.mapStyle === 'map' ? 'satellite' : 'map';
            return {
                mapStyle: newMapStyle,
              };
        }, this.fetchTilesLonLat);
    };

    handleZoomIn = () => {
      this.setState(prevState => ({
        zoom: prevState.zoom + 1
      }), () => {
        this.fetchTilesLonLat(this.state.longitude, this.state.latitude);
      });
    };
    
    handleZoomOut = () => {
      this.setState(prevState => ({
        zoom: prevState.zoom - 1
      }), () => {
        this.fetchTilesLonLat(this.state.longitude, this.state.latitude);
      });
    };
    
handleChange(event) {
  this.setState({ [event.target.name]: event.target.value });
}

  lon2tile = (lon, zoom) => {
    return ((lon + 180) / 360) * Math.pow(2, zoom);
  };

  lat2tile = (lat, zoom) => {
    return (
      ((1 -
        Math.log(
          Math.tan((lat * Math.PI) / 180) + 1 / Math.cos((lat * Math.PI) / 180)
        ) /
          Math.PI) /
        2) *
      Math.pow(2, zoom)
    );
  };

  tileDifference(tileX = 1, tileY = 1, zoom = 16) {
    const tile1 = this.tileXYToLonLat(tileX, tileY, zoom);
    const tile2 = this.tileXYToLonLat(tileX + 1, tileY, zoom);

    // Calculate the differences
    const dist_lon = tile2.lon - tile1.lon;
    const dist_lat = tile2.lat - tile1.lat;

    return { dist_lon: dist_lon, dist_lat: dist_lat };
}


  tileXYToLonLat(tileX, tileY, zoom) {
    const lon = (tileX / Math.pow(2, zoom)) * 360 - 180;

    const n = Math.PI - 2 * Math.PI * tileY / Math.pow(2, zoom);
    const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));

    return { lon: lon, lat: lat };
}

  fetchTilesXY = async () => {
    const { centerTileX, centerTileY, zoom, n_tiles_pad } = this.state;

    let tiles = await this.fetchTiles(
      zoom,
      centerTileX,
      centerTileY,
      n_tiles_pad,
      []
    );

    this.lock_fetch = false;
    this.setState({
      tiles: tiles,
    });
  };

  fetchTiles = async (zoom, tileX, tileY, n_tiles_pad, currentTiles) => {
    const new_tile_coords = [];
    for (let i = -n_tiles_pad; i <= n_tiles_pad; i++) {
      for (let j = -n_tiles_pad; j <= n_tiles_pad; j++) {
        const x = tileX + i;
        const y = tileY + j;
        new_tile_coords.push({ x, y });
      }
    }

    const newTileKeys = new Set(
      new_tile_coords.map((coord) => `${coord.x},${coord.y}`)
    );

    const updatedCurrentTiles = currentTiles.filter((tile) => {
      const coordKey = `${tile.x},${tile.y}`;
      return newTileKeys.has(coordKey);
    });

    const newTiles = [];
    for (const { x, y } of new_tile_coords) {
      const coordKey = `${x},${y}`;
      if (!currentTiles.some((tile) => `${tile.x},${tile.y}` === coordKey)) {
        let url;
        if(this.state.mapStyle==="satellite"){url = `https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile//${zoom}/${y}/${x}`;}
        if(this.state.mapStyle==="map"){url = `https://a.tile.openstreetmap.org/${zoom}/${x}/${y}.png`};

        try {
          const response = await fetch(url);
          const blob = await response.blob();
          const imgURL = URL.createObjectURL(blob);
          newTiles.push({
            x: x + n_tiles_pad,
            y: y + n_tiles_pad,
            imgURL,
          });
        } catch (error) {
          console.error("Failed to fetch tile:", error);
        }
      }
    }

    return [...updatedCurrentTiles, ...newTiles];
  };

  fetchTilesLonLat = async () => {
    const { latitude, longitude, zoom, n_tiles_pad } = this.state;
    let x, y, x_dash, y_dash;
    x_dash = this.lon2tile(longitude, zoom);
    y_dash = this.lat2tile(latitude, zoom);
    x = Math.floor(x_dash);
    y = Math.floor(y_dash);

    //const tileSizeDegrees = 360 / Math.pow(2, zoom);
    //const lonLatPerPixel = tileSizeDegrees / 255; // Degrees per pixel
    const shiftX = this.state.initialShiftX + Math.floor(256 * (x - x_dash)) + 128;
    const shiftY = this.state.initialShiftY + Math.floor(256 * (y - y_dash)) + 128;
    let tiles = await this.fetchTiles(zoom, x, y, n_tiles_pad, []);

    this.setState({
      tiles: tiles,
      shiftX: shiftX,
      shiftY: shiftY,
      centerTileX: x,
      centerTileY: y,
    });
  };

  handleChange = (e) => {
    this.setState({ [e.target.name]: e.target.value });
  };

  renderCanvas = () => {
    const canvas = this.refs.tileCanvas;
    const ctx = canvas.getContext("2d");
    ctx.imageSmoothingEnabled = false;
    const tileSize = 255;

    this.state.tiles.forEach((tile) => {
      const img = new Image();
      img.src = tile.imgURL;
      img.onload = () => {
        const xPos =
          (tile.x - Math.floor(this.state.centerTileX)) * tileSize +
          this.state.offsetX +
          this.state.shiftX;
        const yPos =
          (tile.y - Math.floor(this.state.centerTileY)) * tileSize +
          this.state.offsetY +
          this.state.shiftY;
        ctx.drawImage(img, xPos, yPos, tileSize, tileSize);

        if (false) {
          // Set the line color to red
          ctx.strokeStyle = "red";
          ctx.lineWidth = 1;

          // Draw vertical lines at intervals of 256 pixels
          if(false){
          for (let x = 0; x < canvas.width; x += 256) {
            ctx.beginPath();
            ctx.moveTo(x, 0);
            ctx.lineTo(x, canvas.height);
            ctx.stroke();
          }

          // Draw horizontal lines at intervals of 256 pixels
          for (let y = 0; y < canvas.height; y += 256) {
            ctx.beginPath();
            ctx.moveTo(0, y);
            ctx.lineTo(canvas.width, y);
            ctx.stroke();
          }}

          // Calculate the point position
          const pointX =
            this.state.shiftX +
            this.state.offsetX +
            this.state.tile_cluster_width / 2 -
            128;
          const pointY =
            this.state.shiftY +
            this.state.offsetY +
            this.state.tile_cluster_height / 2 -
            128;

          // Set the point color to red
          ctx.fillStyle = "red";

          // Draw the point
          ctx.beginPath();
          ctx.arc(pointX + 128, pointY + 128, 2, 0, 50 * Math.PI); // 2 is the radius of the point
          ctx.fill();
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(pointX, pointY);
          ctx.lineTo(pointX + 256, pointY);
          ctx.stroke();
          ctx.lineTo(pointX + 256, pointY + 256);
          ctx.stroke();
          ctx.lineTo(pointX, pointY + 256);
          ctx.stroke();
          ctx.lineTo(pointX, pointY);
          ctx.stroke();


          ctx.beginPath();
          ctx.moveTo(0, 255);
          ctx.lineTo(512, 255);
          ctx.stroke();

          ctx.beginPath();
          ctx.moveTo(255, 0);
          ctx.lineTo(255, 512);
          ctx.stroke();
        }
      };
    });
  };

  handleMouseDown = (e) => {
    this.setState({
      dragging: true,
      dragStartX: e.clientX,
      dragStartY: e.clientY,
    });
  };

  handleMouseMove = (e) => {
    if (this.state.dragging) {
      const offsetX = e.clientX - this.state.dragStartX;
      const offsetY = e.clientY - this.state.dragStartY;
      
      // displacement in pixels:
      let displacementX =
        -this.state.offsetX + this.state.initialShiftX - this.state.shiftX;
      let displacementY =
        -this.state.offsetY + this.state.initialShiftY - this.state.shiftY;

      let {centerTileX, centerTileY, shiftX, shiftY, zoom } = this.state;

      let {lon, lat} = this.tileXYToLonLat(centerTileX + 0.5 + displacementX/255 ,
                                           centerTileY + 0.5 + displacementY/255 , zoom);
      if (this.lock_fetch) {
        //console.log("locked");
      } else {      
        if (displacementX > 255 || displacementX < -255) {
          this.lock_fetch = true;
          centerTileX += Math.round(displacementX / 255);
          shiftX = this.state.initialShiftX - offsetX;
        }
      
        if (displacementY > 255 || displacementY < -255) {
          this.lock_fetch = true;
          centerTileY += Math.round(displacementY / 255);
          shiftY = this.state.initialShiftY - offsetY;
        }
      
        if (this.lock_fetch) {
          this.setState(
            {
              centerTileX: centerTileX,
              centerTileY: centerTileY,
              shiftX: shiftX,
              shiftY: shiftY,
              offsetX: offsetX,
              offsetY: offsetY,
            },
            this.fetchTilesXY
          );
        }
      }
      
      this.setState(
        {
          offsetX: offsetX,
          offsetY: offsetY,
          longitude: lon,
          latitude: lat,
        },
        this.renderCanvas
      );
    }
  };

  handleMouseUp = () => {
    this.setState({
      dragging: false,
      shiftX: this.state.shiftX + this.state.offsetX,
      shiftY: this.state.shiftY + this.state.offsetY,
      offsetY: 0,
      offsetX: 0,
    });
  };

  componentDidMount() {
    const canvas = this.refs.tileCanvas;
    canvas.addEventListener("mousedown", this.handleMouseDown);
    canvas.addEventListener("mousemove", this.handleMouseMove);
    canvas.addEventListener("mouseup", this.handleMouseUp);
    this.fillCanvasWithGray(); // Call the fill method when the component mounts
  }

  componentWillUnmount() {
    const canvas = this.refs.tileCanvas;
    canvas.removeEventListener("mousedown", this.handleMouseDown);
    canvas.removeEventListener("mousemove", this.handleMouseMove);
    canvas.removeEventListener("mouseup", this.handleMouseUp);
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.tiles !== this.state.tiles ||
      prevState.offsetX !== this.state.offsetX ||
      prevState.offsetY !== this.state.offsetY ||
      prevState.latitude !== this.state.latitude ||
      prevState.longitude !== this.state.longitude
    ) {
      this.renderCanvas();
    }
  }

  fetchCoordinates(address) {
    fetch(`https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(address)}&format=json&limit=1`, {
      headers: {
        'User-Agent': 'YourAppName/0.1'
      }
    })
    .then(res => res.json())
    .then(res => {
      if (res.length > 0) {
        let { lat, lon } = res[0];
        // Parse lat and lon from response to number
        lat = parseFloat(lat);
        lon = parseFloat(lon);
        this.setState({longitude:lon, latitude:lat}, this.fetchTilesLonLat)
      } else {
        alert('Address not found');
      }
    })
    .catch(err => console.error(err));
  }

  handleSearchClick(address) {
    this.fetchCoordinates(address);
  }

  fillCanvasWithGray() {
    const canvas = this.refs.tileCanvas;
    const ctx = canvas.getContext('2d');
    
    // Fill the entire canvas with dark gray
    ctx.fillStyle = '#404040'; // Set the fill color to a darker gray
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the rectangle
}

  render() {
    return (
      <>
              <div className="canvas-container">
        <canvas
          ref="tileCanvas"
          width={this.state.canvas_width}
          height={this.state.canvas_height}
        ></canvas>
            <div className="map-zoom-controls">
                <button className="map-plus-button" onClick={this.handleZoomIn}>+</button>
                <button className="map-minus-button" onClick={this.handleZoomOut}>−</button>
            </div>
            <div className="map-style-controls">
            <button className="toggle-map-satellite" onClick={this.toggleMapStyle}>
            <img src={this.state.mapStyle === 'map' ? satelliteIcon : mapIcon} alt={`${this.state.mapStyle} view`} />
            </button>
            
            </div>
        </div>
      </>
    );
  }
  
   
}

export default TileMap;

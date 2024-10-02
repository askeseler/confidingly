import React, { Component } from "react";
import './Map.css'; // Importing the CSS file for styles
import mapIcon from '../icons/map.svg'; // Adjust the path to your map icon
import satelliteIcon from '../icons/satellite.svg'; 


class TileMap extends Component {
  constructor(props) {
    super(props);

    const n_tiles_pad = 2;
    let tile_cluster_width = 256 * (2 * n_tiles_pad + 1);
    let tile_cluster_height = 256 * (2 * n_tiles_pad + 1);
    let canvas_width = 600;//document.clientWidth;
    let canvas_height = 500;//document.clientHeight * .5;

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
        markers : [],
        markerActive: false
    };

    this.handleChange = this.handleChange.bind(this);
    this.handleSearchClick = this.handleSearchClick.bind(this);
    this.toggleMapStyle = this.toggleMapStyle.bind(this);
    this.handleClick = this.handleClick.bind(this);
    this.mouseX = 0;
    this.mouseY = 0;
    this.address = "";
    this.longitude;
    this.latitude;
   }

   toggleMarkerActive(){
    this.setState({markerActive: !this.state.markerActive})
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
        this.fetchTilesLonLat();
      });
    };
    
    handleZoomOut = () => {
      this.setState(prevState => ({
        zoom: prevState.zoom - 1
      }), () => {
        this.fetchTilesLonLat();
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


  tileXYToLonLat(tileX, tileY, zoom) {
    const lon = (tileX / Math.pow(2, zoom)) * 360 - 180;

    const n = Math.PI - 2 * Math.PI * tileY / Math.pow(2, zoom);
    const lat = (180 / Math.PI) * Math.atan(Math.sinh(n));

    return { longitude: lon, latitude: lat };
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

  drawSvg = (icon_src, x, y) => {
    return new Promise((resolve, reject) => {
        const canvas = this.refs.tileCanvas1;
        const ctx = canvas.getContext('2d');
        const img = new Image();
        img.src = icon_src; // Set the src to the imported SVG URL
        img.onload = () => {
            ctx.drawImage(img, x, y, 100, 100);
            resolve(); // Resolve the promise after drawing
        };
        img.onerror = (error) => {
            reject(new Error("Image failed to load: " + error));
        };
    });
  };

  async drawMarkers(){
    if(this.state.markerActive) await this.drawSvg(satelliteIcon, this.mouseX, this.mouseY);
    for(let marker of this.state.markers){
      //Identify relative position of marker to center of screen
      let x = this.lon2tile(this.state.longitude, this.state.zoom);
      let y = this.lat2tile(this.state.latitude, this.state.zoom);
      let x_dash = this.lon2tile(marker["longitude"], this.state.zoom);
      let y_dash = this.lat2tile(marker["latitude"], this.state.zoom);
      let x_px_pos = (this.state.canvas_width/2) +(255*(x_dash - x));
      let y_px_pos = (this.state.canvas_height/2) +(255*(y_dash - y));

      await this.drawSvg(satelliteIcon, x_px_pos, y_px_pos)
    }
  }

  renderCanvas = async () => {
    const canvas = this.refs.tileCanvas;      // Main canvas for display
    const canvas1 = this.refs.tileCanvas1;    // Off-screen (buffer) canvas
    const ctx = canvas1.getContext("2d");     // Get context of the buffer canvas
    ctx.imageSmoothingEnabled = false;         // Disable smoothing for pixel art, if applicable
    const tileSize = 255;                       // Size of each tile

    // Clear the buffer canvas before rendering
    ctx.clearRect(0, 0, canvas1.width, canvas1.height);

    // Track how many images have loaded
    let imagesLoaded = 0;

    this.state.tiles.forEach((tile) => {
        const img = new Image();
        img.src = tile.imgURL;
        img.onload = async () => {
            const xPos =
                (tile.x - Math.floor(this.state.centerTileX)) * tileSize +
                this.state.offsetX +
                this.state.shiftX;
            const yPos =
                (tile.y - Math.floor(this.state.centerTileY)) * tileSize +
                this.state.offsetY +
                this.state.shiftY;
            
            // Draw the image on the buffer canvas
            ctx.drawImage(img, xPos, yPos, tileSize, tileSize);
            imagesLoaded++;

            // Check if all images have been loaded
            if (imagesLoaded === this.state.tiles.length) {
                await this.drawMarkers();
                const displayCtx = canvas.getContext("2d");
                //displayCtx.clearRect(0, 0, canvas.width, canvas.height); // Clear the main canvas
                displayCtx.drawImage(canvas1, 0, 0); // Draw the buffer canvas onto the main canvas
            }
            
            if (true) {
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

      let {longitude, latitude} = this.tileXYToLonLat(centerTileX + 0.5 + displacementX/255 ,
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
          longitude: longitude,
          latitude: latitude,
        },
        this.renderCanvas
      );
    }
    const rect = this.refs.tileCanvas.getBoundingClientRect();
    this.mouseX = (e.clientX - rect.left) * (this.refs.tileCanvas.width / rect.width);
    this.mouseY = (e.clientY - rect.top) * (this.refs.tileCanvas.height / rect.height);
    
    this.renderCanvas();
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
    //window.addEventListener('locationchange', function () {alert('location changed!')});

    if(this.props.onMount){
      this.props.onMount((longitude, latitude, zoom) => this.setState({longitude:longitude, latitude:latitude, zoom:zoom}, this.fetchTilesLonLat));
      }
  }

  componentWillUnmount() {
    const canvas = this.refs.tileCanvas;
    canvas.removeEventListener("mousedown", this.handleMouseDown);
    canvas.removeEventListener("mousemove", this.handleMouseMove);
    canvas.removeEventListener("mouseup", this.handleMouseUp);

    if(this.props.onUnmount){
    const { longitude, latitude, zoom } = this.state;
    this.props.onUnmount({ longitude, latitude, zoom });
    }
  }

  componentDidUpdate(prevProps, prevState) {
      this.renderCanvas();
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
    if(address)this.address = address;
    if(this.address !== "")this.fetchCoordinates(address);
  }

  fillCanvasWithGray() {
    const canvas = this.refs.tileCanvas;
    const ctx = canvas.getContext('2d');
    
    // Fill the entire canvas with dark gray
    ctx.fillStyle = '#404040'; // Set the fill color to a darker gray
    ctx.fillRect(0, 0, canvas.width, canvas.height); // Fill the rectangle
}

  add_marker(){
      // Calculate the center position of the central tile
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

      let displacementX =  - (pointX - this.mouseX) - 128;
      let displacementY = - (pointY - this.mouseY) - 128;
      let {centerTileX, centerTileY, zoom} = this.state;
      const {longitude, latitude} = this.tileXYToLonLat(centerTileX + 0.5 + displacementX/255 ,centerTileY + 0.5 + displacementY/255 , zoom);
      this.setState(prevState => ({markers: [{ "longitude": longitude, "latitude": latitude, type: "default" }, ...prevState.markers]}), this.toggleMarkerActive);
      //this.setState({longitude:lon, latitude:lat}, this.fetchTilesLonLat);
  }

  handleClick(){
    if(this.state.markerActive)this.add_marker();
  }

  render() {
    return (
      <>
      <div className="canvas-container">
        <canvas
          ref="tileCanvas"
          width={this.state.canvas_width}
          height={this.state.canvas_height}
          style={{width: "100%", height:"100%"}}
          onClick={this.handleClick}
          />
        <canvas
          ref="tileCanvas1"
          width={this.state.canvas_width}
          height={this.state.canvas_height}
          style={{width: "100%", height:"100%", 'display': 'none' }}
          />
          
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

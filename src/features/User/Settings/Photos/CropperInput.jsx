import React, { Component } from "react";
import Cropper from "react-cropper";
import "cropperjs/dist/cropper.css";

class CropperInput extends Component {
	_crop() {
		const { setImage } = this.props;
		if (typeof this.cropper.getCroppedCanvas() === "undefined") {
			return;
		}
		this.cropper.getCroppedCanvas().toBlob((blob) => {
			setImage(blob);
		});
	}

	onCropperInit(cropper) {
		this.cropper = cropper;
	}

	render() {
		const { imagePreview, height } = this.props;
		return (
			<Cropper
				src={imagePreview}
				style={{ height: { height }, width: "100%" }}
				initialAspectRatio={1}
				preview=".img-preview"
				viewMode={1}
				dragMode="move"
				guides={false}
				scalable={true}
				cropBoxMovable={true}
				cropBoxResizable={true}
				crop={this._crop.bind(this)}
				onInitialized={this.onCropperInit.bind(this)}
			/>
		);
	}
}

export default CropperInput;

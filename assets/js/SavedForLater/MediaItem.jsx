import { useEffect, useState } from "react";

export function MediaItem({ item }) {
  const [isImage, setIsImage] = useState(null);
  const [isFavicon, setIsFavicon] = useState(false);

  useEffect(
    function setImageLayout() {
      setIsImage(null);
      setIsFavicon(false);
      if (!item.image_url) return;

      const img = new Image();
      img.src = item.image_url;

      img.onload = function setImageLayoutHelper() {
        const imageUrl = item.image_url.toLowerCase();
        if (
          img.width < 64 ||
          imageUrl.includes("favicon") ||
          imageUrl.includes("icon") ||
          imageUrl.includes("logo") ||
          imageUrl.endsWith(".ico")
        ) {
          setIsFavicon(true);
        } else if (img.height > img.width) setIsImage("vertical");
        else if (img.width > img.height) setIsImage("horizontal");
      };

      return function cleanup() {
        img.onload = null;
      };
    },

    [item.image_url],
  );

  return (
    <div className="media-card">
      <div className="card-image-wrap">
        {isImage === "horizontal" ? (
          <img
            className="card-image card-image--landscape"
            src={item.image_url}
            alt={item.name}
          />
        ) : (
          isImage === "vertical" && (
            <img className="card-image" src={item.image_url} alt={item.name} />
          )
        )}

        {isImage === null && (
          <div className="card-placeholder">
            {isFavicon && (
              <img
                className="card-placeholder__icon"
                src={item.image_url}
                alt={item.name}
              />
            )}
            <span>{item.name}</span>
          </div>
        )}

        <a
          className="card-link"
          href={item.link}
          target="_blank"
          rel="noreferrer"
        />
      </div>

      <div className="card-body">
        <span className="card-category">
          {item.category.map((c) => c.name).join(", ")}
        </span>
      </div>
    </div>
  );
}

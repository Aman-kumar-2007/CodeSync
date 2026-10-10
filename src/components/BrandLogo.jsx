import React from "react"

export default function BrandLogo({ className = "", alt = "CodeSync logo" }) {
    return (
        <img
            src="/codesync-logo.png"
            alt={alt}
            className={`block object-contain ${className}`}
            draggable="false"
        />
    )
}

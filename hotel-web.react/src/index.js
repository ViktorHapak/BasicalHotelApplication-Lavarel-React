import React from 'react';
import Render, { createRoot } from 'react-dom/client';
import TestComponent from "./components/testcomponent.js";
import {RouterProvider} from "react-router";
import {ContextProvider} from "./ContextProvider.js";
import {router} from "./router";
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';
import '@fortawesome/fontawesome-svg-core';
import '@fortawesome/react-fontawesome';
import './index.css';


//createRoot(document.getElementById('root')).render(<TestComponent />);

Render.createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <ContextProvider>
            <RouterProvider router={router} />
        </ContextProvider>
    </React.StrictMode>
);



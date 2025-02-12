import { Routes, Route } from "react-router-dom";
import routesConfig from "./routes";

const App = () => (
  <Routes>
    {routesConfig.map((route, index) => (
      <Route key={index} path={route.path} element={route.element}>
        {route.children &&
          route.children.map((child, childIndex) => (
            <Route key={childIndex} path={child.path} element={child.element}>
              {child.children &&
                child.children.map((grandChild, grandChildIndex) => (
                  <Route
                    key={grandChildIndex}
                    path={grandChild.path}
                    element={grandChild.element}
                  />
                ))}
            </Route>
          ))}
      </Route>
    ))}
  </Routes>
);

export default App;

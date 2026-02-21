import { useState, useEffect } from "react";
import Header from "./Header";

function Layout({ children }) {
  const [theme, setTheme] = useState("dark");

  useEffect(() => {
    document.body.classList.remove("light");
    if (theme === "light") {
      document.body.classList.add("light");
    }
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  return (
    <>
      <Header theme={theme} toggleTheme={toggleTheme} />
      <div className="container">{children}</div>
    </>
  );
}

export default Layout;

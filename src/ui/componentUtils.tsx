// componentUtils.js

export function getComponents() {
  try {
    const data = localStorage.getItem("searchifi_components");
    return data ? JSON.parse(data) : [];
  } catch (e) {
    console.error("Failed to load components:", e);
    return [];
  }
}

export function deleteComponent(userId, componentId) {
  try {
    const allComponents = getComponents();
    const updatedComponents = allComponents.filter(
      (comp) => comp.id !== componentId || comp.authorId !== userId
    );
    localStorage.setItem("searchifi_components", JSON.stringify(updatedComponents));
    return true;
  } catch (e) {
    console.error("Failed to delete component:", e);
    return false;
  }
}
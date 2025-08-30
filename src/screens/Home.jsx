import React, { useContext, useState, useEffect } from "react";
import { UserContext } from "../context/user.context";
import axios from "../config/axios";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";

const Home = () => {
  const { user } = useContext(UserContext);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [projectName, setProjectName] = useState("");
  const [projects, setProjects] = useState([]);
  const [confirmDelete, setConfirmDelete] = useState(null);

  const navigate = useNavigate();

  // ✅ Force reload only once when user visits this page
  useEffect(() => {
    if (!sessionStorage.getItem("homeReloaded")) {
      sessionStorage.setItem("homeReloaded", "true");
      window.location.reload();
    }
  }, []);

  // ✅ Create project
  function createProject(e) {
    e.preventDefault();

    axios
      .post("/projects/create", { name: projectName })
      .then((res) => {
        setIsModalOpen(false);
        setProjectName("");
        setProjects([...projects, res.data.project]);
      })
      .catch((error) => {
        console.error(error.response?.data || error.message);
      });
  }

  // ✅ Delete project
  function deleteProject(id) {
    axios
      .delete(`/projects/${id}/delete`)
      .then(() => {
        setProjects(projects.filter((p) => p._id !== id));
        setConfirmDelete(null);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
      });
  }

  // ✅ Fetch projects
  useEffect(() => {
    if (!user) return;

    axios
      .get("/projects/all")
      .then((res) => {
        setProjects(res.data.projects || []);
      })
      .catch((err) => {
        console.error(err.response?.data || err.message);
      });
  }, [user]);

  return (
    <main className="p-6 relative min-h-screen bg-gradient-to-br from-slate-50 to-slate-200">
      {/* Projects grid */}
      <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {projects.map((project, idx) => {
          if (!project) return null;
          return (
            <motion.div
              key={project._id || idx}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="relative p-6 rounded-2xl bg-white shadow-lg hover:shadow-xl transition-all cursor-pointer flex flex-col justify-between"
              onClick={() =>
                navigate(`/project`, { state: { project } })
              }
            >
              {/* Delete button */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setConfirmDelete(project);
                }}
                className="absolute top-3 right-3 text-slate-400 hover:text-red-500 transition"
              >
                <i className="ri-delete-bin-6-line text-lg"></i>
              </button>

              <h2 className="text-lg font-semibold text-slate-800 truncate">
                {project.name}
              </h2>
              <div className="flex items-center gap-2 mt-3 text-slate-500">
                <i className="ri-user-line text-slate-400"></i>
                <span className="text-sm">
                  {project.users?.length || 0} collaborators
                </span>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Floating Action Button */}
      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 p-4 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-500 transition-colors"
      >
        <i className="ri-add-line text-2xl"></i>
      </button>

      {/* Create Project Modal */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-8 rounded-2xl shadow-2xl w-full max-w-md"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-2xl font-semibold text-slate-800 mb-6">
                Create New Project
              </h2>
              <form onSubmit={createProject}>
                <div className="mb-5">
                  <label className="block text-sm font-medium text-slate-600">
                    Project Name
                  </label>
                  <input
                    onChange={(e) => setProjectName(e.target.value)}
                    value={projectName}
                    type="text"
                    className="mt-2 block w-full px-4 py-2 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 focus:outline-none"
                    required
                  />
                </div>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 rounded-xl bg-blue-600 text-white font-medium hover:bg-blue-500 transition"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Confirm Delete Modal */}
      <AnimatePresence>
        {confirmDelete && (
          <motion.div
            className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-sm"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
              <h2 className="text-lg font-semibold text-slate-800">
                Delete Project
              </h2>
              <p className="text-slate-600 mt-2">
                Are you sure you want to delete{" "}
                <span className="font-medium">{confirmDelete.name}</span>?
              </p>
              <div className="flex justify-end gap-3 mt-6">
                <button
                  className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 transition"
                  onClick={() => setConfirmDelete(null)}
                >
                  Cancel
                </button>
                <button
                  onClick={() => deleteProject(confirmDelete._id)}
                  className="px-5 py-2 rounded-xl bg-red-600 text-white hover:bg-red-500 transition"
                >
                  Delete
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </main>
  );
};

export default Home;

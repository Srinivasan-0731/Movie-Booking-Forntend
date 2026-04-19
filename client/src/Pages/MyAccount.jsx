import React, { useState, useEffect } from "react";
import { useAppContext } from "../context/AppContext";
import toast from "react-hot-toast";
import { X } from "lucide-react";

export default function MyAccount() {
  const { user, setUser, axios, logout, navigate } = useAppContext();

  const [isEditing, setIsEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [showAddAccount, setShowAddAccount] = useState(false);
  const [anotherEmail, setAnotherEmail] = useState("");

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || "");
      setUsername(user.username || "");
      setPhone(user.phone || "");
      setPreview(user.image || "");
    }
  }, [user]);

  if (!user) return <div className="p-10">Login first</div>;

  const getInitials = (name) =>
    name ? name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) : "U";

  const pickImage = (e) => {
    const f = e.target.files[0];
    if (!f) return;
    setImage(f);
    setPreview(URL.createObjectURL(f));
  };

  const save = async () => {
    try {
      const fd = new FormData();
      fd.append("fullName", fullName);
      fd.append("username", username);
      fd.append("phone", phone);
      if (image) fd.append("image", image);

      const { data } = await axios.put("/api/user/update-profile", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (!data.success) return toast.error("Update failed");

      setUser(data.user);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Profile updated!");
      setIsEditing(false);
    } catch {
      toast.error("Update error");
    }
  };

  const changePwd = async () => {
    try {
      const { data } = await axios.put("/api/user/change-password", {
        oldPassword,
        newPassword,
      });
      if (data.success) {
        toast.success("Password updated!");
        setShowPwd(false);
        setOldPassword("");
        setNewPassword("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error updating password");
    }
  };

  const addToAnotherAccount = async () => {
    if (!anotherEmail) return toast.error("Enter email");
    try {
      const { data } = await axios.post("/api/user/add-to-account", {
        targetEmail: anotherEmail,
      });
      if (data.success) {
        toast.success("Added successfully");
        setShowAddAccount(false);
        setAnotherEmail("");
      } else {
        toast.error(data.message);
      }
    } catch {
      toast.error("Error adding account");
    }
  };

  return (
    <div className="min-h-screen pt-28 px-4 flex items-start justify-center">
      <div className="w-full max-w-md relative">

    
        <button
          onClick={() => navigate(-1)}
          className="absolute -top-10 mt-11 mr-3 right-0 text-gray-400 hover:text-white transition cursor-pointer z-10"
        >
          <X className="w-8 h-8 hover:bg-red-700 rounded-md" />
        </button>

        <div className="bg-gray-900 border border-gray-700 rounded-2xl overflow-hidden">

        
          <div className="bg-gray-800 px-6 py-6 flex items-center gap-4 border-b border-gray-700">
            {preview ? (
              <img src={preview} className="w-16 h-16 rounded-full object-cover" />
            ) : (
              <div className="w-16 h-16 rounded-full bg-purple-900 flex items-center justify-center text-purple-200 text-xl font-medium">
                {getInitials(user.fullName)}
              </div>
            )}
            <div>
              <h2 className="text-lg font-semibold text-white">{user.fullName}</h2>
              <p className="text-sm text-gray-400">@{user.username}</p>
            </div>
          </div>

          
          {!isEditing ? (
            <div className="px-6 py-4 space-y-0">
              {[
                { label: "Email", value: user.email },
                { label: "Phone", value: user.phone || "Not set" },
                { label: "Username", value: `@${user.username}` },
              ].map(({ label, value }) => (
                <div key={label} className="flex items-center justify-between py-3 border-b border-gray-700 last:border-0">
                  <span className="text-sm text-gray-400">{label}</span>
                  <span className="text-sm text-white font-medium">{value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="px-6 py-4 space-y-3">
              <div>
                <label className="text-xs text-gray-400 mb-1 block">Profile Photo</label>
                <input type="file" onChange={pickImage} className="text-sm text-gray-300" />
              </div>
              {[
                { label: "Full Name", value: fullName, setter: setFullName },
                { label: "Username", value: username, setter: setUsername },
                { label: "Phone", value: phone, setter: setPhone, type: "tel" },
              ].map(({ label, value, setter, type }) => (
                <div key={label}>
                  <label className="text-xs text-gray-400 mb-1 block">{label}</label>
                  <input
                    type={type || "text"}
                    value={value}
                    onChange={(e) => setter(e.target.value)}
                    className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
                  />
                </div>
              ))}
            </div>
          )}

          
          <div className="px-6 py-4 border-t border-gray-700 grid grid-cols-2 gap-2">
            {!isEditing ? (
              <>
                <button onClick={() => setIsEditing(true)}
                  className="py-2 rounded-lg text-sm font-medium bg-purple-900 text-purple-200 hover:bg-purple-800 transition cursor-pointer">
                  Edit Profile
                </button>
                <button onClick={() => setShowPwd(true)}
                  className="py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 transition cursor-pointer">
                  Change Password
                </button>
                <button onClick={() => setShowAddAccount(true)}
                  className="py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 transition cursor-pointer">
                  Add Account
                </button>
                <button onClick={logout}
                  className="py-2 rounded-lg text-sm font-medium bg-red-900 text-red-300 hover:bg-red-800 transition cursor-pointer">
                  Logout
                </button>
              </>
            ) : (
              <>
                <button onClick={save}
                  className="py-2 rounded-lg text-sm font-medium bg-purple-900 text-purple-200 hover:bg-purple-800 transition cursor-pointer">
                  Save
                </button>
                <button onClick={() => setIsEditing(false)}
                  className="py-2 rounded-lg text-sm font-medium bg-gray-800 text-gray-200 border border-gray-600 hover:bg-gray-700 transition cursor-pointer">
                  Cancel
                </button>
              </>
            )}
          </div>
        </div>

        
        {showPwd && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 space-y-3">

        
              <button
                onClick={() => setShowPwd(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-semibold text-white">Change Password</h3>
              <input
                type="password"
                placeholder="Current password"
                value={oldPassword}
                onChange={(e) => setOldPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <input
                type="password"
                placeholder="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={changePwd}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-purple-900 text-purple-200 hover:bg-purple-800 transition cursor-pointer">
                  Update
                </button>
              </div>
            </div>
          </div>
        )}

        
        {showAddAccount && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
            <div className="relative bg-gray-900 border border-gray-700 rounded-2xl p-6 w-80 space-y-3">

              
              <button
                onClick={() => setShowAddAccount(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-white transition cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <h3 className="text-base font-semibold text-white">Add to Another Account</h3>
              <input
                placeholder="Enter account email"
                value={anotherEmail}
                onChange={(e) => setAnotherEmail(e.target.value)}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-purple-500"
              />
              <div className="flex gap-2 pt-1">
                <button onClick={addToAnotherAccount}
                  className="flex-1 py-2 rounded-lg text-sm font-medium bg-purple-900 text-purple-200 hover:bg-purple-800 transition cursor-pointer">
                  Add
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
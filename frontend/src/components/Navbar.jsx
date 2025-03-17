import { Link } from "react-router-dom";
import { LogOut, Banknote, Settings, User } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";

const Navbar = () => {
    const { logout } = useAuthStore()

    return (
        <header className="bg-base-300 border-b border-base-300 fixed w-full top-0 z-40 shadow-md">
            <div className="container mx-auto px-6 h-16 flex items-center justify-between">
                <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition-all">
                    <div className="size-10 rounded-lg bg-accent flex items-center justify-center">
                        <Banknote className="w-6 h-6 text-accent-content" />
                    </div>
                    <h1 className="text-xl font-extrabold text-base-content">Auction System</h1>
                </Link>
                
                <nav className="flex items-center gap-4">
                    <Link to="/settings" className="btn btn-sm bg-base-100 text-base-content flex gap-2 items-center transition-all">
                        <Settings className="w-5 h-5" />
                        <span className="hidden sm:inline">Settings</span>
                    </Link>
                    <Link to="/profile" className="btn btn-sm bg-base-100 text-base-content flex gap-2 items-center transition-all">
                        <User className="w-5 h-5" />
                        <span className="hidden sm:inline">Profile</span>
                    </Link>
                    <button className="btn btn-sm bg-base-100 text-base-content flex gap-2 items-center transition-all" onClick={logout}>
                        <LogOut className="w-5 h-5" />
                        <span className="hidden sm:inline">Logout</span>
                    </button>
                </nav>
            </div>
        </header>
    );
};

export default Navbar;

import { Film, Mail, UserSearch, MapPin } from "lucide-react"
import { Link } from "react-router-dom"

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-white">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-2">
              <Film className="h-6 w-6 text-purple-400" />
              <span className="text-xl font-bold">CinePax</span>
            </Link>
            <p className="text-slate-300 text-sm">
              Your ultimate destination for movie tickets and entertainment. Experience cinema like never before.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/movies" className="text-slate-300 hover:text-white transition-colors">
                  Movies
                </Link>
              </li>
              <li>
                <Link to="/theaters" className="text-slate-300 hover:text-white transition-colors">
                  Theaters
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Support</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Help Center
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Terms of Service
                </Link>
              </li>
              <li>
                <Link to="/" className="text-slate-300 hover:text-white transition-colors">
                  Privacy Policy
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contact Info</h3>
            <ul className="space-y-2 text-sm">
              <li className="flex items-center space-x-2">
                <UserSearch className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">https://www.linkedin.com/in/abuzerzia/</span>
              
              </li>
              <li className="flex items-center space-x-2">
                <UserSearch className="h-4 w-4 text-purple-400" />
                 <span className="text-slate-300">https://github.com/abuzerexe</span> 
              </li>
              <li className="flex items-center space-x-2">
                <Mail className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">abouzer381@gmail.com</span>
              </li>
              <li className="flex items-center space-x-2">
                <MapPin className="h-4 w-4 text-purple-400" />
                <span className="text-slate-300">123 Cinema Street, Movie City</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 mt-8 pt-8 text-center">
          <p className="text-slate-400 text-sm">© {new Date().getFullYear()} CinePax. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

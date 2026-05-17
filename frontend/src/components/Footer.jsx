import React from 'react';


const Footer = () => {
  return (
    <footer className="mt-10 border-t border-white/10 bg-white/5 backdrop-blur-md text-white">

      <div className="max-w-6xl mx-auto px-6 py-8 grid md:grid-cols-3 gap-8">

        {/* Brand */}
        <div>
          <h2 className="text-xl font-bold mb-2">JEEVANCARE</h2>
          <p className="text-gray-300 text-sm">
            Your smart healthcare companion. Track health, manage appointments, and stay fit.
          </p>
        </div>

        {/* Links */}
        <div>
          <h3 className="font-semibold mb-3">Quick Links</h3>
          <ul className="text-gray-300 space-y-2 text-sm">
            <li className="hover:text-white cursor-pointer">Home</li>
            <li className="hover:text-white cursor-pointer">Appointments</li>
            <li className="hover:text-white cursor-pointer">Workouts</li>
            <li className="hover:text-white cursor-pointer">Profile</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h3 className="font-semibold mb-3">Contact</h3>
          <p className="text-gray-300 text-sm">📧 support@jeevancare.com</p>
          <p className="text-gray-300 text-sm mt-1">📞 +91 98765 43210</p>
        </div>

      </div>

      {/* Bottom */}
      <div className="border-t border-white/10 text-center py-4 text-gray-400 text-sm">
        © {new Date().getFullYear()} JEEVANCARE. All rights reserved.
      </div>

    </footer>
  );
};

export default Footer;
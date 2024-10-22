export default function Footer() {
  return (
    <footer className="bg-gray-800 text-white p-4 mt-8">
      <div className="container mx-auto text-center">
        <p className="text-gray-300 text-sm md:text-base">&copy; {new Date().getFullYear()} Your Company Name. All rights reserved.</p>
        <div className="mt-2 flex flex-col md:flex-row justify-center space-y-2 md:space-y-0 md:space-x-4">
          <a href="#" className="text-blue-300 hover:text-yellow-300 transition duration-300 text-sm md:text-base">Privacy Policy</a>
          <a href="#" className="text-blue-300 hover:text-yellow-300 transition duration-300 text-sm md:text-base">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
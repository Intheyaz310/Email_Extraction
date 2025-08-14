import { useEffect, useState, useRef } from "react";
import ChromaticSmoke from "@/components/hero/ChromaticSmoke";
import { Card } from "@/components/ui/card";
import { toast } from "@/components/ui/use-toast";
import { useNavigate } from "react-router-dom";
import {
  SidebarProvider,
  Sidebar,
  SidebarContent,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarHeader,
  SidebarSeparator,
} from "@/components/ui/sidebar";

// API URL
const API_URL = "http://localhost:5000/api";
import {
  BarChart2,
  Briefcase,
  Building2,
  Landmark,
  MapPin,
  Mail,
  Settings,
  PieChart,
  Users,
  Inbox,
  Play,
  Bell,
  Calendar,
  User,
  Home,
  Zap,
  Wrench,
  Bot,
  FileText,
  LogOut,
  LayoutGrid,
  Compass,
  Info,
  Clock,
  Activity,
  BatteryFull,
  Table,
  CircleHelp,
  RotateCcw,
  ShieldCheck,
  Plug,
  Filter,
  Download,
  DollarSign,
  Eye,
  UserCheck,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import TopRightMenu from "@/components/ui/top-right-menu";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const stats = [
  { label: "Total Jobs", value: 7, icon: <BarChart2 className="w-7 h-7 text-blue-400" /> },
  { label: "Companies", value: 7, icon: <Building2 className="w-7 h-7 text-slate-400" /> },
  { label: "Job Types", value: 2, icon: <Briefcase className="w-7 h-7 text-amber-500" /> },
  { label: "Industries", value: 1, icon: <Landmark className="w-7 h-7 text-cyan-400" /> },
  { label: "Locations", value: 0, icon: <MapPin className="w-7 h-7 text-pink-400" /> },
];

const statusStats = [
  { label: "Status", value: "Ready", color: "text-green-400" },
  { label: "Last Run", value: "Never" },
  { label: "Total Records", value: 7 },
  { label: "Auto-Extraction", value: <span className="inline-block w-4 h-4 rounded-full bg-red-500 mr-2 align-middle" /> },
];

const dashboardStats = [
  { label: "Total Jobs", value: 7, icon: <BarChart2 className="w-6 h-6 text-blue-400" /> },
  { label: "Companies", value: 7, icon: <Building2 className="w-6 h-6 text-slate-400" /> },
  { label: "Job Types", value: 2, icon: <Briefcase className="w-6 h-6 text-amber-500" /> },
  { label: "Industries", value: 1, icon: <Landmark className="w-6 h-6 text-cyan-400" /> },
];

export default function Dashboard() {
  const [loaded, setLoaded] = useState(false);
  const [extractedEmails, setExtractedEmails] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    localStorage.removeItem('userId');
    toast({ title: 'Logged out', description: 'You have been signed out.' });
    navigate('/');
  };
  
  useEffect(() => { 
    setLoaded(true); 
    
    // Check if user is logged in
    const userId = localStorage.getItem('userId');
    if (!userId) {
      toast({
        title: "Authentication Required",
        description: "Please log in to access the dashboard.",
        variant: "destructive"
      });
      navigate('/');
      return;
    }
    
    // Fetch extracted emails
    const fetchExtractedEmails = async () => {
      try {
        const response = await fetch(`${API_URL}/email-extraction/history/${userId}`);
        const data = await response.json();
        
        if (!response.ok) {
          throw new Error(data.error || 'Failed to fetch data');
        }
        
        setExtractedEmails(data.extractions || []);
      } catch (error) {
        console.error('Error fetching extracted emails:', error);
        toast({
          title: "Data Fetch Error",
          description: error.message,
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExtractedEmails();
  }, [navigate]);

  // Placeholder report files
  const [showResults, setShowResults] = useState(false);
  const reportFiles = [
    "Report_2024-06-01.xlsx",
    "Report_2024-05-28.xlsx",
    "Report_2024-05-20.xlsx",
    "Report_2024-05-12.xlsx",
    "Report_2024-05-01.xlsx",
  ];

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const userDropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!userDropdownOpen) return;
    function handleClick(e: MouseEvent) {
      if (
        userDropdownRef.current &&
        !userDropdownRef.current.contains(e.target as Node)
      ) {
        setUserDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [userDropdownOpen]);

  const [activeSidebar, setActiveSidebar] = useState("Live Status");

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#222831]">
        {/* Sidebar */}
        <aside className="fixed top-0 left-0 z-30 flex flex-col items-center w-16 h-screen bg-gray-900 rounded-l-2xl border border-[#232b36] py-4 shadow-lg">
          {/* Window controls */}
          <div className="flex items-center gap-1 mb-6">
            <span className="w-3 h-3 rounded-full bg-red-500 inline-block" />
            <span className="w-3 h-3 rounded-full bg-yellow-400 inline-block" />
            <span className="w-3 h-3 rounded-full bg-green-500 inline-block" />
          </div>
          {/* FEATURE label */}
          <span className="text-[10px] text-gray-400 tracking-widest mb-2">FEATURE</span>
          {/* Feature icons with tooltips */}
          <TooltipProvider delayDuration={0}>
            <nav className="flex flex-col gap-2 mb-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 shadow-md mb-1 ${activeSidebar === "Live Status" ? "border-2 border-cyan-400 bg-cyan-700/80 text-white shadow-lg" : "bg-[#232b36] text-white hover:bg-[#2a3a54]"}`}
                    onClick={() => setActiveSidebar("Live Status")}
                    aria-current={activeSidebar === "Live Status" ? "page" : undefined}
                  >
                    <Activity className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Live Status</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${activeSidebar === "Email Configuration" ? "border-2 border-cyan-400 bg-cyan-700/80 text-white shadow-lg" : "text-gray-300 bg-[#232b36] hover:bg-[#2a3a54]"}`}
                    onClick={() => setActiveSidebar("Email Configuration")}
                    aria-current={activeSidebar === "Email Configuration" ? "page" : undefined}
                  >
                    <Mail className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Email Configuration</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${activeSidebar === "Job Extraction" ? "border-2 border-cyan-400 bg-cyan-700/80 text-white shadow-lg" : "text-gray-300 bg-[#232b36] hover:bg-[#2a3a54]"}`}
                    onClick={() => setActiveSidebar("Job Extraction")}
                    aria-current={activeSidebar === "Job Extraction" ? "page" : undefined}
                  >
                    <Briefcase className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Job Extraction</TooltipContent>
              </Tooltip>
              <Tooltip>
                <TooltipTrigger asChild>
                  <button
                    className={`w-10 h-10 flex items-center justify-center rounded-full transition-all duration-200 ${activeSidebar === "Data Viewer" ? "border-2 border-cyan-400 bg-cyan-700/80 text-white shadow-lg" : "text-gray-300 bg-[#232b36] hover:bg-[#2a3a54]"}`}
                    onClick={() => setActiveSidebar("Data Viewer")}
                    aria-current={activeSidebar === "Data Viewer" ? "page" : undefined}
                  >
                    <Table className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Data Viewer</TooltipContent>
              </Tooltip>
            </nav>
          </TooltipProvider>
          {/* SUPPORT label */}
          <span className="text-[10px] text-gray-400 tracking-widest mb-2 mt-2">SUPPORT</span>
          <TooltipProvider delayDuration={0}>
            <nav className="flex flex-col gap-2 mb-4">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl text-gray-300 hover:bg-[#232b36] transition-colors">
                    <CircleHelp className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Help</TooltipContent>
              </Tooltip>
            </nav>
          </TooltipProvider>
          {/* Logout at bottom with tooltip */}
          <TooltipProvider delayDuration={0}>
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
              <Tooltip>
                <TooltipTrigger asChild>
                  <button className="w-10 h-10 flex items-center justify-center rounded-xl text-rose-400 hover:bg-[#232b36] transition-colors" onClick={handleLogout}>
                    <LogOut className="w-6 h-6" />
                  </button>
                </TooltipTrigger>
                <TooltipContent side="right" align="center">Logout</TooltipContent>
              </Tooltip>
            </div>
          </TooltipProvider>
        </aside>
        {/* Main Content */}
        <main className="flex-1 relative min-h-screen w-full overflow-hidden" style={{ marginLeft: '4.5rem' }}>
      {/* Animated background */}
      <div className="absolute inset-0 w-full h-full pointer-events-none z-0">
        <ChromaticSmoke colorMode="custom" customColor="#222831" />
      </div>
      {/* Main Content */}
      <div className="relative z-10 w-full flex flex-col items-center justify-start px-4 sm:px-6 lg:px-8 pt-8">
        <TopRightMenu />
        {/* Header */}
        {activeSidebar !== "Email Configuration" && activeSidebar !== "Job Extraction" && activeSidebar !== "Data Viewer" && (
        <div className="w-full max-w-7xl flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold text-white mb-1">
              Welcome {(() => {
                try {
                  const user = JSON.parse(localStorage.getItem('user') || 'null');
                  return user?.name || user?.email || 'User';
                } catch { return 'User'; }
              })()}
            </h2>
            <p className="text-sm text-white/70">All systems are running smoothly! You have 3 unread alerts!</p>
          </div>
          <div className="flex items-center gap-4">
            <button className="relative p-2 rounded-full hover:bg-white/10 transition-colors">
              <Bell className="w-6 h-6 text-white" />
              <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full border-2 border-white" />
            </button>
            <button className="flex items-center gap-2 px-3 py-1 rounded-md bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors">
              <Calendar className="w-4 h-4 mr-1" /> Today (10 Jan 2021)
            </button>
            <div className="relative" ref={userDropdownRef}>
              <button
                className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center focus:outline-none"
                onClick={() => setUserDropdownOpen((open) => !open)}
              >
                <User className="w-6 h-6 text-white" />
              </button>
              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-[#232b36] border border-[#222831] rounded-xl shadow-lg py-2 z-50 animate-fade-in">
                  <div className="px-4 py-2 text-white/90 text-sm font-semibold">User</div>
                    <button className="w-full text-left px-4 py-2 text-white/80 hover:bg-[#232b36] transition-colors text-sm">Fetch New Emails</button>
                    <button className="w-full text-left px-4 py-2 text-white/80 hover:bg-[#232b36] transition-colors text-sm">Quick Extraction</button>
                    <button className="w-full text-left px-4 py-2 text-white/80 hover:bg-[#232b36] transition-colors text-sm">View Reports</button>
                  <div className="border-t border-white/10 my-1" />
                    <button className="w-full text-left px-4 py-2 text-rose-400 hover:bg-[#232b36] transition-colors text-sm" onClick={handleLogout}>Logout</button>
                </div>
              )}
            </div>
          </div>
        </div>
        )}
            {activeSidebar === "Email Configuration" ? (
              <>
                {/* Email Configuration Heading and Subtitle */}
                <div className="w-full max-w-7xl mb-8 animate-fade-in-up">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-white">Email Configuration</h1>
                      <span className="text-xs text-gray-500 font-semibold bg-gray-100 border border-gray-200 rounded-full px-3 py-1 transition-colors duration-200 hover:bg-gray-200 hover:text-gray-900 cursor-pointer">Not Connected</span>
                    </div>
                    <div className="text-gray-500 text-base">Configure your email settings to extract job postings</div>
                  </div>
                </div>
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-4 animate-fade-in-up">
                  {/* Email Credentials Card */}
                  <div className="group bg-gradient-to-br from-blue-900/60 to-blue-700/40 border border-blue-800 rounded-2xl shadow-md p-8 flex flex-col min-h-[340px] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-6 h-6 text-blue-400" />
                      <span className="text-2xl font-bold text-white">Email Credentials</span>
                    </div>
                    <div className="text-white/70 text-sm mb-4">Enter your email credentials to connect to your mailbox</div>
                    <label className="block text-xs text-white/80 mb-1" htmlFor="email">Email Address</label>
                    <input id="email" type="email" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="your.email@company.com" />
                    <label className="block text-xs text-white/80 mb-1" htmlFor="password">Password / App Password</label>
                    <input id="password" type="password" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 mb-1 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="••••••••" />
                    <div className="text-xs text-white/60 mb-4">Use an app-specific password for better security</div>
                    <div className="flex items-center bg-white/10 rounded-lg px-4 py-3">
                      <input id="env-toggle" type="checkbox" className="accent-blue-500 w-5 h-5 mr-3" />
                      <label htmlFor="env-toggle" className="text-sm text-white/80">Use environment variables instead</label>
                    </div>
              </div>
                  {/* Server Settings Card */}
                  <div className="group bg-gradient-to-br from-green-900/60 to-green-700/40 border border-green-800 rounded-2xl shadow-md p-8 flex flex-col min-h-[340px] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                      <Settings className="w-6 h-6 text-green-400" />
                      <span className="text-2xl font-bold text-white">Server Settings</span>
            </div>
                    <div className="text-white/70 text-sm mb-4">Configure IMAP server settings for your email provider</div>
                    <label className="block text-xs text-white/80 mb-1" htmlFor="imap-server">IMAP Server</label>
                    <input id="imap-server" type="text" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="imap.gmail.com" />
                    <label className="block text-xs text-white/80 mb-1" htmlFor="imap-port">Port</label>
                    <input id="imap-port" type="text" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 mb-4 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="993" />
                    <div className="bg-white/10 border border-green-300/10 rounded-lg p-4 mt-2">
                      <div className="text-sm font-semibold text-green-200 mb-2">Common Settings</div>
                      <div className="flex flex-col gap-1 text-xs">
                        <div className="flex justify-between"><span className="text-white/80">Gmail:</span><a href="#" className="text-green-200 hover:underline">imap.gmail.com:993</a></div>
                        <div className="flex justify-between"><span className="text-white/80">Outlook:</span><a href="#" className="text-green-200 hover:underline">outlook.office365.com:993</a></div>
                        <div className="flex justify-between"><span className="text-white/80">Yahoo:</span><a href="#" className="text-green-200 hover:underline">imap.mail.yahoo.com:993</a></div>
              </div>
            </div>
              </div>
            </div>
                {/* Security Notice Card with Save & Connect Button inside */}
                <div className="w-full max-w-7xl animate-fade-in-up mt-8">
                  <div className="group bg-gradient-to-br from-purple-900/60 to-purple-700/40 border border-purple-800 rounded-2xl shadow-md p-8 flex items-center gap-4 justify-between transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-4">
                      <span className="flex items-center justify-center w-12 h-12 rounded-full bg-white/10">
                        <ShieldCheck className="w-7 h-7 text-green-400" />
                      </span>
                      <div>
                        <div className="text-xl font-bold text-white mb-1">Security Notice</div>
                        <div className="text-white/70 text-sm">Your credentials are encrypted and stored securely</div>
                      </div>
              </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-gray-400 text-white font-semibold text-base shadow hover:bg-gray-500 transition-all">
                      <Plug className="w-5 h-5" />
                      Save & Connect
              </button>
                  </div>
                </div>
              </>
            ) : activeSidebar === "Job Extraction" ? (
              <>
                {/* Job Extraction Header */}
                <div className="w-full max-w-7xl mb-8 animate-fade-in-up">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center justify-between">
                      <h1 className="text-3xl font-bold text-white">Job Extraction Settings</h1>
                      <span className="text-xs text-gray-200 font-semibold bg-gray-800 border border-gray-700 rounded-full px-3 py-1">Auto-runs every 5 minutes</span>
                    </div>
                    <div className="text-gray-300 text-base">Configure and run job email extraction</div>
                  </div>
                </div>
                {/* Stats Row */}
                <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-6 mb-4 animate-fade-in-up">
                  <div className="flex-1 min-w-[180px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-6 h-6 text-green-400" />
                      <span className="text-2xl font-bold text-white">1,247</span>
                    </div>
                    <div className="text-xs text-white/70">Total Emails Processed</div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Users className="w-6 h-6 text-blue-400" />
                      <span className="text-2xl font-bold text-white">89</span>
                    </div>
                    <div className="text-xs text-white/70">Jobs Extracted</div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Clock className="w-6 h-6 text-purple-400" />
                      <span className="text-2xl font-bold text-white">2 min</span>
                    </div>
                    <div className="text-xs text-white/70">Avg Processing Time</div>
                  </div>
                </div>
                {/* Main Cards Row */}
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-4 animate-fade-in-up">
                  {/* Email Selection Card */}
                  <div className="group bg-gradient-to-br from-blue-900/60 to-blue-700/40 border border-blue-800 rounded-2xl shadow-md p-8 flex flex-col min-h-[340px] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-6 h-6 text-blue-400" />
                      <span className="text-2xl font-bold text-white">Email Selection</span>
                    </div>
                    <div className="text-white/70 text-sm mb-4">Choose which emails to process for job extraction</div>
                    <div className="mb-4">
                      <div className="text-xs text-white/80 mb-1">Email Type</div>
                      <div className="flex gap-6 mb-2">
                        <label className="flex items-center gap-2 text-white/90 text-sm">
                          <input type="radio" name="emailType" className="accent-blue-500" defaultChecked />
                          Unread emails only
                        </label>
                        <label className="flex items-center gap-2 text-white/90 text-sm">
                          <input type="radio" name="emailType" className="accent-blue-500" />
                          All emails
                        </label>
                      </div>
                      <div className="text-xs text-white/80 mb-1">Number of Emails</div>
                      <select className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 mb-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option>10 emails</option>
                        <option>25 emails</option>
                        <option>50 emails</option>
                        <option>100 emails</option>
                      </select>
                    </div>
                  </div>
                  {/* Filters & Date Range Card */}
                  <div className="group bg-gradient-to-br from-green-900/60 to-green-700/40 border border-green-800 rounded-2xl shadow-md p-8 flex flex-col min-h-[340px] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1">
                      <Filter className="w-6 h-6 text-green-400" />
                      <span className="text-2xl font-bold text-white">Filters & Date Range</span>
                    </div>
                    <div className="text-white/70 text-sm mb-4">Apply filters to target specific emails</div>
                    <div className="flex gap-4 mb-4">
                      <div className="flex-1">
                        <div className="text-xs text-white/80 mb-1">From Date</div>
                        <input type="date" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
                      </div>
                      <div className="flex-1">
                        <div className="text-xs text-white/80 mb-1">To Date</div>
                        <input type="date" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-green-400" />
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-white/80 mb-1">Filter by Sender</div>
                      <input type="text" className="w-full rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 mb-1 focus:outline-none focus:ring-2 focus:ring-green-400" placeholder="hr@company.com, jobs@startup.io" />
                      <div className="text-xs text-white/60">Comma-separated email addresses (optional)</div>
                    </div>
                  </div>
                </div>
                {/* Ready to Extract Jobs Card */}
                <div className="w-full max-w-7xl animate-fade-in-up mb-4">
                  <div className="group bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-md p-6 flex items-center justify-between transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-3">
                      <Download className="w-7 h-7 text-blue-400" />
                      <div>
                        <div className="text-lg font-semibold text-white">Ready to Extract Jobs</div>
                        <div className="text-white/70 text-sm">Click to start manual extraction with current settings</div>
                      </div>
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 rounded-lg bg-blue-600 text-white font-semibold text-base shadow hover:bg-blue-700 transition-all">
                      <Play className="w-5 h-5" />
                      Run Extraction
                    </button>
                  </div>
                </div>
              </>
            ) : activeSidebar === "Data Viewer" ? (
              <>
                {/* Data Viewer Header */}
                <div className="w-full max-w-7xl mb-8 animate-fade-in-up flex items-center justify-between">
                  <div>
                    <h1 className="text-3xl font-bold text-white">Job Data Viewer</h1>
                    <div className="text-gray-300 text-base">Browse and manage extracted job postings</div>
                  </div>
                  <button className="flex items-center gap-2 px-5 py-2 rounded-lg bg-gray-900 text-white font-semibold text-base shadow hover:bg-gray-800 transition-all">
                    <Download className="w-5 h-5" />
                    Export Excel
                  </button>
                </div>
                {/* Search & Filter Card */}
                <div className="w-full max-w-7xl animate-fade-in-up mb-8">
                  <div className="group bg-gradient-to-br from-blue-900/60 to-blue-700/40 border border-blue-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-3 mb-1">
                      <Filter className="w-6 h-6 text-blue-400" />
                      <span className="text-xl font-bold text-white">Search & Filter</span>
                    </div>
                    <div className="text-white/70 text-sm mb-2">Find specific jobs using filters and search</div>
                    <div className="flex flex-col sm:flex-row gap-4">
                      <input type="text" className="flex-1 rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-400" placeholder="Search by job title, company, or skills..." />
                      <select className="w-48 rounded-md bg-white/90 border border-gray-200 text-gray-900 text-sm p-2 focus:outline-none focus:ring-2 focus:ring-blue-400">
                        <option>All Status</option>
                        <option>New</option>
                        <option>Viewed</option>
                        <option>Applied</option>
                      </select>
                    </div>
                  </div>
                </div>
                {/* Main Content Row */}
                <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8 animate-fade-in-up">
                  {/* Job Listings Card */}
                  <div className="lg:col-span-2 group bg-gradient-to-br from-green-900/60 to-green-700/40 border border-green-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xl font-bold text-white">Job Listings (3)</span>
                      <span className="text-xs text-white/60">3 total jobs</span>
                    </div>
                    {/* Job Item 1 */}
                    <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-2 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Senior Frontend Developer</span>
                        <span className="text-xs bg-blue-900 text-white rounded-full px-3 py-1 font-semibold">New</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-white/70">
                        <span><Building2 className="inline w-4 h-4 mr-1" />TechCorp Inc</span>
                        <span><MapPin className="inline w-4 h-4 mr-1" />San Francisco, CA</span>
                        <span><DollarSign className="inline w-4 h-4 mr-1" />$120k - $160k</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-blue-800 text-white text-xs rounded-full px-2 py-0.5">React</span>
                        <span className="bg-blue-800 text-white text-xs rounded-full px-2 py-0.5">TypeScript</span>
                        <span className="bg-blue-800 text-white text-xs rounded-full px-2 py-0.5">Node.js</span>
                      </div>
                    </div>
                    {/* Job Item 2 */}
                    <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-2 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">Full Stack Engineer</span>
                        <span className="text-xs bg-gray-800 text-white rounded-full px-3 py-1 font-semibold">Viewed</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-white/70">
                        <span><Building2 className="inline w-4 h-4 mr-1" />StartupXYZ</span>
                        <span><MapPin className="inline w-4 h-4 mr-1" />Remote</span>
                        <span><DollarSign className="inline w-4 h-4 mr-1" />$90k - $130k</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-green-800 text-white text-xs rounded-full px-2 py-0.5">Python</span>
                        <span className="bg-green-800 text-white text-xs rounded-full px-2 py-0.5">Django</span>
                        <span className="bg-green-800 text-white text-xs rounded-full px-2 py-0.5">React</span>
                        <span className="bg-green-800 text-white text-xs rounded-full px-2 py-0.5">+1 more</span>
                      </div>
                    </div>
                    {/* Job Item 3 */}
                    <div className="bg-white/5 rounded-xl p-4 flex flex-col gap-2 border border-white/10">
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-white">DevOps Engineer</span>
                        <span className="text-xs bg-purple-800 text-white rounded-full px-3 py-1 font-semibold">Applied</span>
                      </div>
                      <div className="flex flex-wrap gap-4 text-xs text-white/70">
                        <span><Building2 className="inline w-4 h-4 mr-1" />CloudWorks</span>
                        <span><MapPin className="inline w-4 h-4 mr-1" />New York, NY</span>
                        <span><DollarSign className="inline w-4 h-4 mr-1" />$100k - $150k</span>
                      </div>
                      <div className="flex flex-wrap gap-2 mt-2">
                        <span className="bg-purple-800 text-white text-xs rounded-full px-2 py-0.5">Kubernetes</span>
                        <span className="bg-purple-800 text-white text-xs rounded-full px-2 py-0.5">Docker</span>
                        <span className="bg-purple-800 text-white text-xs rounded-full px-2 py-0.5">AWS</span>
                        <span className="bg-purple-800 text-white text-xs rounded-full px-2 py-0.5">+1 more</span>
                      </div>
                    </div>
                  </div>
                  {/* Job Details Card */}
                  <div className="group bg-gradient-to-br from-purple-900/60 to-purple-700/40 border border-purple-800 rounded-2xl shadow-md p-6 flex flex-col gap-4 transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl min-h-[340px]">
                    <span className="text-xl font-bold text-white mb-2">Job Details</span>
                    <div className="flex-1 flex flex-col items-center justify-center text-white/60">
                      <Eye className="w-12 h-12 mb-2" />
                      <span>Select a job from the list to view details</span>
                    </div>
                  </div>
                </div>
                {/* Stats Row */}
                <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-6 mb-4 animate-fade-in-up">
                  <div className="flex-1 min-w-[180px] bg-gradient-to-br from-blue-900/60 to-blue-700/40 border border-blue-800 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Briefcase className="w-6 h-6 text-blue-400" />
                      <span className="text-2xl font-bold text-white">3</span>
                    </div>
                    <div className="text-xs text-white/70">Total Jobs</div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-gradient-to-br from-green-900/60 to-green-700/40 border border-green-800 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Mail className="w-6 h-6 text-green-400" />
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div className="text-xs text-white/70">New Jobs</div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-gradient-to-br from-yellow-900/60 to-yellow-700/40 border border-yellow-800 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <Eye className="w-6 h-6 text-yellow-400" />
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div className="text-xs text-white/70">Viewed</div>
                  </div>
                  <div className="flex-1 min-w-[180px] bg-gradient-to-br from-purple-900/60 to-purple-700/40 border border-purple-800 rounded-2xl p-6 shadow-xl text-left flex flex-col items-start justify-center transition-all duration-300 hover:scale-105 hover:shadow-2xl">
                    <div className="flex items-center gap-2 mb-1">
                      <UserCheck className="w-6 h-6 text-purple-400" />
                      <span className="text-2xl font-bold text-white">1</span>
                    </div>
                    <div className="text-xs text-white/70">Applied</div>
                  </div>
                </div>
              </>
            ) : (
              <>
                {/* Stat Cards Row - minimalistic with icons */}
                <div className="w-full max-w-7xl flex flex-col sm:flex-row gap-6 mb-4">
                  {/* Card 1: Last Extraction */}
                  <div className="group flex-1 min-w-[200px] min-h-[120px] bg-blue-900/60 backdrop-blur-md border border-blue-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="absolute top-1/2 right-5 -translate-y-1/2">
                      <div className="bg-blue-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                        <Clock className="w-6 h-6 text-blue-200/70" />
                      </div>
                    </div>
                    <div className="text-white/80 text-xs font-semibold mb-1">Last Extraction</div>
                    <div className="text-3xl font-bold text-white mb-1">12:51:34</div>
                    <div className="text-xs text-white/60">Jul 18, 2025</div>
                  </div>
                  {/* Card 2: New Jobs Found */}
                  <div className="group flex-1 min-w-[200px] min-h-[120px] bg-green-900/60 backdrop-blur-md border border-green-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="absolute top-1/2 right-5 -translate-y-1/2">
                      <div className="bg-green-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                        <Briefcase className="w-6 h-6 text-green-200/70" />
                      </div>
                    </div>
                    <div className="text-white/80 text-xs font-semibold mb-1">New Jobs Found</div>
                    <div className="text-3xl font-bold text-green-200 mb-1">3</div>
                    <div className="text-xs text-green-200/80">+2 from last run</div>
                  </div>
                  {/* Card 3: Excel Updated */}
                  <div className="group flex-1 min-w-[200px] min-h-[120px] bg-purple-900/60 backdrop-blur-md border border-purple-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="absolute top-1/2 right-5 -translate-y-1/2">
                      <div className="bg-purple-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                        <FileText className="w-6 h-6 text-purple-200/70" />
                      </div>
                    </div>
                    <div className="text-white/80 text-xs font-semibold mb-1">Excel Updated</div>
                    <div className="text-3xl font-bold text-white mb-1">12:53</div>
                    <div className="text-xs text-white/60">3 minutes ago</div>
                  </div>
                  {/* Card 4: Next Run In */}
                  <div className="group flex-1 min-w-[200px] min-h-[120px] bg-orange-900/60 backdrop-blur-md border border-orange-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="absolute top-1/2 right-5 -translate-y-1/2">
                      <div className="bg-orange-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                        <Play className="w-6 h-6 text-orange-200/70" />
                      </div>
                    </div>
                    <div className="text-white/80 text-xs font-semibold mb-1">Next Run In</div>
                    <div className="text-2xl font-bold text-orange-200 mb-1">2:34</div>
                    <div className="text-xs text-orange-200/80">Auto extraction</div>
                  </div>
                </div>
                {/* Main Cards Row */}
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
                  {/* 2x2 Glassy Cards Grid (reference style) with transitions and unique colors */}
                  {/* Cards removed as per request */}
                </div>
                {/* Lower Section: Extraction Progress and Recent Activity */}
                <div className="w-full max-w-7xl grid grid-cols-1 md:grid-cols-2 gap-8 mb-4">
                  {/* Extraction Progress Card */}
                  <div className="group bg-gradient-to-br from-blue-900/60 to-blue-700/40 border border-blue-800 rounded-2xl shadow-md p-8 flex flex-col min-h-[300px] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1 justify-between">
                      <div className="flex items-center gap-2">
                        <Activity className="w-6 h-6 text-blue-400" />
                        <span className="text-2xl font-bold text-white">Extraction Progress</span>
                      </div>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-blue-800/40 transition-colors">
                              <RotateCcw className="w-5 h-5 text-blue-300" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" align="center">Refresh</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-white/70 text-sm mb-4">Current processing status and progress</div>
                    <div className="border-b border-white/10 mb-4"></div>
                    <div className="flex items-center gap-3 mb-4">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 text-xs font-semibold group-hover:shadow-blue-400/40 group-hover:shadow-lg transition">
                        <svg className="animate-spin w-3 h-3 mr-1" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" /></svg>
                        Processing
                      </span>
                      <span className="text-white/80 text-xs">Processing emails...</span>
                      <span className="ml-auto text-white/90 text-sm font-semibold">20%</span>
                    </div>
                    <div className="w-full h-3 bg-white/10 rounded-full mb-8 overflow-hidden">
                      <div className="h-3 bg-gradient-to-r from-blue-400 via-blue-500 to-blue-600 rounded-full shadow-inner transition-all duration-700" style={{ width: '20%', transition: 'width 0.7s cubic-bezier(0.4,0,0.2,1)' }}>
                        <span className="block text-xs text-white/90 text-center font-bold" style={{ minWidth: '40px' }}></span>
            </div>
          </div>
                    <div className="grid grid-cols-2 gap-6 mt-2">
                      <div className="flex flex-col items-center justify-center bg-blue-900/60 rounded-xl py-6 shadow border border-blue-300/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
              <div className="flex items-center gap-2 mb-1">
                          <Mail className="w-5 h-5 text-blue-300 group-hover:animate-pulse" />
                          <span className="text-2xl font-bold text-white">15</span>
              </div>
                        <div className="text-xs text-white/70 font-medium">Emails Scanned</div>
            </div>
                      <div className="flex flex-col items-center justify-center bg-blue-900/60 rounded-xl py-6 shadow border border-blue-300/10 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                        <div className="flex items-center gap-2 mb-1">
                          <Briefcase className="w-5 h-5 text-blue-300 group-hover:animate-pulse" />
                          <span className="text-2xl font-bold text-white">3</span>
            </div>
                        <div className="text-xs text-white/70 font-medium">Jobs Extracted</div>
            </div>
          </div>
        </div>
                  {/* Recent Activity Card */}
                  <div className="group bg-gradient-to-br from-green-900/60 to-green-700/40 border border-green-800 rounded-2xl shadow-md p-8 flex flex-col min-h-[300px] transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                    <div className="flex items-center gap-2 mb-1 justify-between">
                      <div className="flex items-center gap-2">
                        <svg width="24" height="24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-green-500"><polyline points="6 15 12 9 18 15" /><path d="M12 19V9" /></svg>
                        <span className="text-2xl font-bold text-white">Recent Activity</span>
                      </div>
                      <TooltipProvider delayDuration={0}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-green-800/40 transition-colors">
                              <RotateCcw className="w-5 h-5 text-green-300" />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent side="left" align="center">Refresh</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="text-white/70 text-sm mb-4">Live logs and status updates</div>
                    <div className="border-b border-white/10 mb-4"></div>
                    <div className="flex flex-col gap-4">
                      {/* Activity 1 */}
                      <div className="flex items-center bg-green-900/60 rounded-xl px-4 py-3 border-l-4 border-l-green-400 hover:bg-green-800 transition-all group-hover:scale-105 group-hover:shadow-xl">
                        <span className="text-xs text-white/60 w-16 font-mono">12:56:34</span>
                        <div className="flex-1 px-2">
                          <div className="text-white text-sm font-medium">Email connection established successfully</div>
                        </div>
                        <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-semibold group-hover:bg-green-500/40 group-hover:shadow-green-400/40 group-hover:shadow-lg transition">success</span>
                      </div>
                      {/* Activity 2 */}
                      <div className="flex items-center bg-green-900/60 rounded-xl px-4 py-3 border-l-4 border-l-blue-400 hover:bg-green-800 transition-all group-hover:scale-105 group-hover:shadow-xl">
                        <span className="text-xs text-white/60 w-16 font-mono">12:51:34</span>
                        <div className="flex-1 px-2">
                          <div className="text-white text-sm font-medium">Started processing 15 unread emails</div>
              </div>
                        <span className="ml-auto text-xs px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 font-semibold group-hover:bg-blue-500/40 group-hover:shadow-blue-400/40 group-hover:shadow-lg transition">info</span>
              </div>
                      {/* Activity 3 */}
                      <div className="flex items-center bg-green-900/60 rounded-xl px-4 py-3 border-l-4 border-l-green-400 hover:bg-green-800 transition-all group-hover:scale-105 group-hover:shadow-xl">
                        <span className="text-xs text-white/60 w-16 font-mono">12:46:34</span>
                        <div className="flex-1 px-2">
                          <div className="text-white text-sm font-medium">Extracted 3 new job postings</div>
              </div>
                        <span className="ml-auto text-xs px-3 py-1 rounded-full bg-green-500/20 text-green-300 font-semibold group-hover:bg-green-500/40 group-hover:shadow-green-400/40 group-hover:shadow-lg transition">success</span>
              </div>
            </div>
                  </div>
                </div>
                {/* System Health Card - professional enhancement, stat card style blocks */}
                <div className="w-full max-w-7xl mb-4 mt-8">
                  <div className="group bg-gradient-to-br from-white/10 to-purple-900/60 backdrop-blur-md border border-white/20 rounded-2xl shadow-2xl p-10 transition-all duration-300 ease-in-out animate-fade-in-up">
                    <div className="flex items-center gap-3 mb-1">
                      <BatteryFull className="w-7 h-7 text-purple-300" />
                      <span className="text-2xl font-bold text-white tracking-tight">System Health</span>
                    </div>
                    <div className="text-white/70 text-sm mb-4">Overview of system components and their status</div>
                    <div className="border-b border-white/10 mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      {/* Email Connection */}
                      <div className="group flex-1 min-w-[200px] min-h-[120px] bg-green-900/60 backdrop-blur-md border border-green-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-1/2 right-5 -translate-y-1/2">
                          <div className="bg-green-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                            <svg width='26' height='26' fill='none' stroke='#22c55e' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12' /></svg>
                          </div>
                        </div>
                        <div className="text-white/80 text-xs font-semibold mb-1">Email Connection</div>
                        <div className="text-2xl font-bold text-white mb-1">Healthy</div>
                        <div className="text-xs text-white/60">Status</div>
                      </div>
                      {/* Extraction Service */}
                      <div className="group flex-1 min-w-[200px] min-h-[120px] bg-blue-900/60 backdrop-blur-md border border-blue-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-1/2 right-5 -translate-y-1/2">
                          <div className="bg-blue-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                            <svg width='26' height='26' fill='none' stroke='#2563eb' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12' /></svg>
            </div>
          </div>
                        <div className="text-white/80 text-xs font-semibold mb-1">Extraction Service</div>
                        <div className="text-2xl font-bold text-white mb-1">Running</div>
                        <div className="text-xs text-white/60">Status</div>
                      </div>
                      {/* Database */}
                      <div className="group flex-1 min-w-[200px] min-h-[120px] bg-purple-900/60 backdrop-blur-md border border-purple-300/10 rounded-2xl p-6 shadow-xl text-left relative transition-all duration-300 ease-in-out hover:scale-105 hover:shadow-2xl animate-fade-in-up">
                        <div className="absolute top-1/2 right-5 -translate-y-1/2">
                          <div className="bg-purple-800/40 rounded-full p-2 flex items-center justify-center transition-all duration-300 group-hover:animate-pulse">
                            <svg width='26' height='26' fill='none' stroke='#a78bfa' strokeWidth='2' strokeLinecap='round' strokeLinejoin='round'><polyline points='20 6 9 17 4 12' /></svg>
            </div>
              </div>
                        <div className="text-white/80 text-xs font-semibold mb-1">Database</div>
                        <div className="text-2xl font-bold text-white mb-1">Connected</div>
                        <div className="text-xs text-white/60">Status</div>
              </div>
            </div>
          </div>
        </div>
              </>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
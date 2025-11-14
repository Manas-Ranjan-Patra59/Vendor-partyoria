import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ArrowRight, Calendar, Star, BarChart3, CheckCircle, BookOpen, CalendarPlus, Gamepad2 } from "lucide-react";
import Lottie from "lottie-react";
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const Index = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-primary">
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-20">
        <div className="text-center text-white mb-16 animate-fade-in">
          <h1 className="text-6xl font-bold mb-6">
            Vendor Hub
          </h1>
          <p className="text-2xl mb-8 text-white/90">
            Manage your event services business with ease
          </p>
          <Button
            size="lg"
            className="bg-white text-primary hover:bg-white/90 text-lg px-8 py-6 h-auto"
            onClick={() => navigate("/onboarding")}
          >
            Get Started
            <ArrowRight className="ml-2 w-5 h-5" />
          </Button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-20">
          {[
            { 
              icon: null, 
              title: "Manage Bookings", 
              description: "Track all your event bookings in one place", 
              iconColor: "text-blue-500", 
              bgColor: "bg-transparent",
              isLottie: false,
              isDotLottie: false,
              isImage: false,
              is3D: true,
              emoji: "📅"
            },
            { 
              icon: null, 
              title: "Customer Reviews", 
              description: "Build reputation with authentic customer feedback", 
              iconColor: "text-yellow-400", 
              bgColor: "bg-transparent",
              isLottie: false,
              is3D: true,
              emoji: "⭐"
            },
            { 
              icon: null, 
              title: "Analytics", 
              description: "Track revenue and performance metrics", 
              iconColor: "text-green-400", 
              bgColor: "bg-transparent",
              isLottie: false,
              is3D: true,
              emoji: "📊"
            },
            { 
              icon: null, 
              title: "Verification", 
              description: "Get verified to unlock premium features", 
              iconColor: "text-purple-400", 
              bgColor: "bg-transparent",
              isLottie: false,
              is3D: true,
              emoji: "✅"
            },
          ].map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className="bg-white/10 backdrop-blur-sm border border-white/20 rounded-2xl p-6 hover:bg-white/20 transition-all hover:scale-105 animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={`${feature.bgColor} w-12 h-12 rounded-xl flex items-center justify-center mb-4 shadow-lg`}>
                  {feature.isImage ? (
                    <img 
                      src={feature.imageUrl} 
                      alt={feature.title}
                      style={{ 
                        width: '32px', 
                        height: '32px',
                        objectFit: 'contain'
                      }}
                    />
                  ) : feature.is3D ? (
                    <div className="text-2xl">{feature.emoji}</div>
                  ) : feature.isLottie ? (
                    <Lottie 
                      animationData={{
                        "v": "5.5.7",
                        "meta": {"g": "LottieFiles AE ", "a": "", "k": "", "d": "", "tc": ""},
                        "fr": 60,
                        "ip": 0,
                        "op": 120,
                        "w": 24,
                        "h": 24,
                        "nm": "star",
                        "ddd": 0,
                        "assets": [],
                        "layers": [{
                          "ddd": 0,
                          "ind": 1,
                          "ty": 4,
                          "nm": "star",
                          "sr": 1,
                          "ks": {
                            "o": {"a": 0, "k": 100, "ix": 11},
                            "r": {"a": 1, "k": [{"i": {"x": [0.833], "y": [0.833]}, "o": {"x": [0.167], "y": [0.167]}, "t": 0, "s": [0]}, {"t": 120, "s": [360]}], "ix": 10},
                            "p": {"a": 0, "k": [12, 12, 0], "ix": 2},
                            "a": {"a": 0, "k": [0, 0, 0], "ix": 1},
                            "s": {"a": 0, "k": [100, 100, 100], "ix": 6}
                          },
                          "ao": 0,
                          "shapes": [{
                            "ty": "gr",
                            "it": [{
                              "ind": 0,
                              "ty": "sh",
                              "ix": 1,
                              "ks": {
                                "a": 0,
                                "k": {
                                  "i": [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                                  "o": [[0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0], [0, 0]],
                                  "v": [[0, -6], [1.8, -1.8], [6, -1.8], [2.4, 1.2], [3.6, 6], [0, 3.6], [-3.6, 6], [-2.4, 1.2], [-6, -1.8], [-1.8, -1.8]],
                                  "c": true
                                },
                                "ix": 2
                              },
                              "nm": "Path 1",
                              "mn": "ADBE Vector Shape - Group",
                              "hd": false
                            }, {
                              "ty": "fl",
                              "c": {"a": 0, "k": [1, 0.843, 0, 1], "ix": 4},
                              "o": {"a": 0, "k": 100, "ix": 5},
                              "r": 1,
                              "bm": 0,
                              "nm": "Fill 1",
                              "mn": "ADBE Vector Graphic - Fill",
                              "hd": false
                            }, {
                              "ty": "tr",
                              "p": {"a": 0, "k": [0, 0], "ix": 2},
                              "a": {"a": 0, "k": [0, 0], "ix": 1},
                              "s": {"a": 0, "k": [100, 100], "ix": 3},
                              "r": {"a": 0, "k": 0, "ix": 6},
                              "o": {"a": 0, "k": 100, "ix": 7},
                              "sk": {"a": 0, "k": 0, "ix": 4},
                              "sa": {"a": 0, "k": 0, "ix": 5},
                              "nm": "Transform"
                            }],
                            "nm": "Group 1",
                            "np": 2,
                            "cix": 2,
                            "bm": 0,
                            "ix": 1,
                            "mn": "ADBE Vector Group",
                            "hd": false
                          }],
                          "ip": 0,
                          "op": 120,
                          "st": 0,
                          "bm": 0
                        }]
                      }}
                      className="w-72 h-72 sm:w-96 sm:h-96"
                      loop={true}
                    />
                  ) : (
                    <Icon className={`w-6 h-6 ${feature.iconColor} ${feature.title === 'Manage Bookings' ? 'animate-pulse' : feature.title === 'Analytics' ? 'animate-pulse' : feature.title === 'Verification' ? 'animate-pulse' : ''}`} />
                  )}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-white/80">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Index;

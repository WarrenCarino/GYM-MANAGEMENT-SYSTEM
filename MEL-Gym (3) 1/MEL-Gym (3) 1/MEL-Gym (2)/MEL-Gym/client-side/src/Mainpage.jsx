import { Link } from "react-router-dom";
import { useState } from "react";
import {
  FaPhoneAlt,
  FaEnvelope,
  FaMapMarkerAlt,
  FaClock,
  FaFacebookF
} from "react-icons/fa";
import backgroundImage from './assets/4cc5728d-3f35-4cf2-bfec-dad8532d7a9d.jpg';
import logo from './assets/1.png';

function Mainpage() {
  const [hoveredLink, setHoveredLink] = useState(null);
  const [hoveredLoginBtn, setHoveredLoginBtn] = useState(false);
  const [hoveredSignupBtn, setHoveredSignupBtn] = useState(false);
  const [hoveredSession, setHoveredSession] = useState(null);
  const [hoveredPlan, setHoveredPlan] = useState(null);
  const [hoveredSocial, setHoveredSocial] = useState(null);

  // Enhanced Color Palette
  const colors = {
    primary: '#CA972D', // Gold
    darkGreen: '#1B2F1F',
    deepGreen: '#0F1B13',
    forestGreen: '#2D4A32',
    oliveGreen: '#3D5A3E',
    lightGold: '#E8BD5A',
    cream: '#F5EFE0',
    charcoal: '#1A1A1A',
    silver: '#C0C0C0'
  };

  return (
    <div style={{ fontFamily: "'Lato', sans-serif" }}>
      {/* Hero Section */}
      <section
        className="hero"
        style={{
          backgroundImage: `linear-gradient(135deg, rgba(27, 47, 31, 0.85), rgba(15, 27, 19, 0.85)), url(${backgroundImage})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          height: '100vh',
          display: 'flex',
          flexDirection: 'column',
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        {/* Subtle overlay pattern */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'radial-gradient(circle at 20% 50%, rgba(202, 151, 45, 0.08) 0%, transparent 50%)',
          pointerEvents: 'none'
        }}></div>

        {/* Animated accent elements */}
        <div style={{
          position: 'absolute',
          top: '10%',
          right: '5%',
          width: '200px',
          height: '200px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(202, 151, 45, 0.15) 0%, transparent 70%)',
          animation: 'pulse 4s ease-in-out infinite',
          pointerEvents: 'none'
        }}></div>

        <div style={{
          position: 'absolute',
          bottom: '15%',
          left: '5%',
          width: '150px',
          height: '150px',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(212, 175, 55, 0.1) 0%, transparent 70%)',
          animation: 'pulse 6s ease-in-out infinite',
          pointerEvents: 'none'
        }}></div>

        <style>{`
          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.1); }
          }
          @keyframes slideDown {
            from { opacity: 0; transform: translateY(-20px); }
            to { opacity: 1; transform: translateY(0); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'flex-start',
          padding: '20px 40px',
          gap: '40px',
          position: 'relative',
          zIndex: 10,
          background: 'linear-gradient(180deg, rgba(15, 27, 19, 0.9) 0%, transparent 100%)'
        }}>
          <img src={logo} alt="MEL Gym Logo" style={{
            height: '120px',
            width: 'auto',
            filter: 'drop-shadow(0 4px 8px rgba(0, 0, 0, 0.5))',
            animation: 'slideDown 0.8s ease-out'
          }} />
          {['membership', 'personal-training', 'about'].map((link, index) => (
            <a 
              key={link}
              href={`#${link}`}
              onMouseEnter={() => setHoveredLink(index)}
              onMouseLeave={() => setHoveredLink(null)}
              style={{
                color: hoveredLink === index ? colors.lightGold : colors.cream,
                textDecoration: 'none',
                fontSize: '18px',
                fontWeight: '600',
                padding: '8px 24px',
                position: 'relative',
                transition: 'all 0.3s ease',
                borderBottom: hoveredLink === index ? `3px solid ${colors.primary}` : '3px solid transparent',
                paddingBottom: '6px',
                letterSpacing: '0.5px',
                animation: `slideDown 0.8s ease-out ${0.1 + index * 0.1}s both`
              }}
            >
              {link === 'membership' ? 'MEMBERSHIP' : link === 'personal-training' ? 'PERSONAL TRAINING' : 'ABOUT US'}
            </a>
          ))}

          <div style={{ marginLeft: 'auto', display: 'flex', gap: '16px', animation: 'slideDown 0.8s ease-out 0.4s both' }}>
            <Link to="/login">
              <button 
                onMouseEnter={() => setHoveredLoginBtn(true)}
                onMouseLeave={() => setHoveredLoginBtn(false)}
                style={{
                  background: hoveredLoginBtn ? colors.primary : 'transparent',
                  border: `2px solid ${colors.primary}`,
                  color: hoveredLoginBtn ? colors.deepGreen : colors.cream,
                  padding: '12px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  letterSpacing: '1px',
                  boxShadow: hoveredLoginBtn ? '0 4px 20px rgba(202, 151, 45, 0.4)' : 'none'
                }}
              >LOGIN</button>
            </Link>
            <Link to="/signup">
              <button 
                onMouseEnter={() => setHoveredSignupBtn(true)}
                onMouseLeave={() => setHoveredSignupBtn(false)}
                style={{
                  background: hoveredSignupBtn ? colors.lightGold : colors.primary,
                  border: 'none',
                  color: hoveredSignupBtn ? colors.deepGreen : colors.charcoal,
                  padding: '12px 32px',
                  fontSize: '18px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  borderRadius: '8px',
                  transition: 'all 0.3s ease',
                  letterSpacing: '1px',
                  boxShadow: hoveredSignupBtn ? '0 6px 24px rgba(202, 151, 45, 0.5)' : '0 4px 12px rgba(202, 151, 45, 0.3)'
                }}
              >SIGN UP</button>
            </Link>
          </div>
        </div>

        {/* Hero Content - centered with animation */}
        <div style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          textAlign: 'center',
          position: 'relative',
          zIndex: 5,
          padding: '0 40px'
        }}>
          <h1 style={{
            fontSize: '72px',
            fontWeight: '900',
            color: colors.lightGold,
            margin: '0 0 20px 0',
            fontFamily: "'Times New Roman', serif",
            letterSpacing: '2px',
            textShadow: '3px 3px 8px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 1s ease-out 0.2s both'
          }}>
            TRANSFORM YOUR BODY
          </h1>
          
          <h2 style={{
            fontSize: '48px',
            fontWeight: '700',
            color: colors.primary,
            margin: '0 0 30px 0',
            fontFamily: "'Times New Roman', serif",
            letterSpacing: '1.5px',
            textShadow: '2px 2px 6px rgba(0, 0, 0, 0.5)',
            animation: 'slideUp 1s ease-out 0.3s both'
          }}>
            STRENGTHEN YOUR MIND
          </h2>

          <p style={{
            fontSize: '24px',
            color: colors.cream,
            maxWidth: '800px',
            lineHeight: '1.8',
            fontWeight: '300',
            marginBottom: '50px',
            animation: 'slideUp 1s ease-out 0.4s both'
          }}>
            Join MEL Gym and become part of a community dedicated to excellence, strength, and transformation
          </p>

          <div style={{
            display: 'flex',
            gap: '24px',
            justifyContent: 'center',
            animation: 'slideUp 1s ease-out 0.5s both',
            flexWrap: 'wrap'
          }}>
            <div style={{
              textAlign: 'center',
              color: colors.cream
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '10px',
                color: colors.primary
              }}>💪</div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>State-of-the-Art Equipment</p>
            </div>

            <div style={{
              textAlign: 'center',
              color: colors.cream
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '10px',
                color: colors.primary
              }}>🏆</div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>Expert Trainers</p>
            </div>

            <div style={{
              textAlign: 'center',
              color: colors.cream
            }}>
              <div style={{
                fontSize: '48px',
                marginBottom: '10px',
                color: colors.primary
              }}>🤝</div>
              <p style={{
                fontSize: '18px',
                fontWeight: '600',
                letterSpacing: '0.5px'
              }}>Supportive Community</p>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Section */}
      <section style={{
        background: `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.darkGreen} 100%)`,
        padding: '100px 40px',
        textAlign: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div style={{
          position: 'absolute',
          top: '-50px',
          right: '-50px',
          width: '400px',
          height: '400px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(202, 151, 45, 0.1) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}></div>
        
        <h2 style={{
          color: colors.primary,
          fontSize: '56px',
          fontFamily: "'Times New Roman', serif",
          marginBottom: '40px',
          fontWeight: '700',
          textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)',
          letterSpacing: '2px'
        }}>WELCOME TO OUR GYM</h2>
        <p style={{
          color: colors.cream,
          fontSize: '22px',
          lineHeight: '1.9',
          maxWidth: '900px',
          margin: '0 auto',
          fontWeight: '300'
        }}>
          We provide a supportive environment for everyone, regardless of their fitness level. 
          Join us to start your journey towards a healthier, stronger you.
        </p>
      </section>

      {/* Sessions Section */}
      <section style={{
        background: `linear-gradient(180deg, ${colors.forestGreen} 0%, ${colors.oliveGreen} 100%)`,
        padding: '100px 40px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <h2 style={{
          color: colors.primary,
          fontSize: '56px',
          fontFamily: "'Times New Roman', serif",
          marginBottom: '70px',
          fontWeight: '700',
          letterSpacing: '3px',
          textTransform: 'uppercase',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)'
        }}>OUR SESSIONS</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '40px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {[
            { name: 'STRENGTH\nTRAINING', icon: '💪', gradient: 'linear-gradient(135deg, #1B2F1F 0%, #2D4A32 100%)' },
            { name: 'CARDIO', icon: '🏃', gradient: 'linear-gradient(135deg, #2D4A32 0%, #3D5A3E 100%)' },
            { name: 'CROSSFIT', icon: '🏋️', gradient: 'linear-gradient(135deg, #1B2F1F 0%, #2D4A32 100%)' },
            { name: 'FUNCTIONAL', icon: '🤸', gradient: 'linear-gradient(135deg, #2D4A32 0%, #3D5A3E 100%)' }
          ].map((session, index) => (
            <div 
              key={index}
              onMouseEnter={() => setHoveredSession(index)}
              onMouseLeave={() => setHoveredSession(null)}
              style={{
                background: session.gradient,
                borderRadius: '20px',
                padding: '50px 30px',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                minHeight: '300px',
                transition: 'all 0.4s ease',
                cursor: 'pointer',
                border: hoveredSession === index ? `3px solid ${colors.primary}` : '3px solid transparent',
                transform: hoveredSession === index ? 'translateY(-12px) scale(1.02)' : 'translateY(0)',
                boxShadow: hoveredSession === index ? `0 12px 40px rgba(202, 151, 45, 0.4)` : '0 4px 15px rgba(0, 0, 0, 0.3)',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              {hoveredSession === index && (
                <div style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  background: 'radial-gradient(circle at center, rgba(202, 151, 45, 0.15) 0%, transparent 70%)',
                  pointerEvents: 'none'
                }}></div>
              )}
              <div style={{
                fontSize: '90px',
                marginBottom: '28px',
                transition: 'transform 0.4s ease',
                transform: hoveredSession === index ? 'scale(1.2) rotate(5deg)' : 'scale(1)',
                filter: hoveredSession === index ? 'drop-shadow(0 4px 8px rgba(202, 151, 45, 0.5))' : 'none'
              }}>{session.icon}</div>
              <p style={{
                color: hoveredSession === index ? colors.lightGold : colors.primary,
                fontSize: '26px',
                fontWeight: 'bold',
                fontFamily: "'Oswald', sans-serif",
                margin: 0,
                textAlign: 'center',
                whiteSpace: 'pre-line',
                letterSpacing: '1.5px',
                transition: 'color 0.3s ease'
              }}>{session.name}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Membership Plans */}
      <section id="membership" style={{
        background: `linear-gradient(180deg, ${colors.charcoal} 0%, ${colors.deepGreen} 100%)`,
        padding: '100px 40px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          bottom: '-100px',
          left: '-100px',
          width: '500px',
          height: '500px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(202, 151, 45, 0.08) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}></div>

        <h2 style={{
          color: colors.primary,
          fontSize: '56px',
          fontFamily: "'Times New Roman', serif",
          marginBottom: '70px',
          fontWeight: '700',
          letterSpacing: '3px',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.5)'
        }}>MEMBERSHIP PLANS</h2>
        
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '40px',
          maxWidth: '1400px',
          margin: '0 auto'
        }}>
          {[
            { name: 'WEEKLY', price: 'P100/MONTH', features: ['5 CLASSES PER WEEK', 'GYM ACCESS', 'GROUP CLASSES'], showButton: true },
            { name: 'WALK-IN', price: 'P100/DAY', features: ['GYM ACCESS'], highlight: true, showButton: false },
            { name: 'MONTHLY', price: 'P2000/MONTH', features: ['GYM ACCESS', 'GROUP CLASSES', 'PERSONAL TRAINING', 'ADDITIONAL AMENITIES'], showButton: true }
          ].map((plan, index) => (
            <div 
              key={index}
              onMouseEnter={() => setHoveredPlan(index)}
              onMouseLeave={() => setHoveredPlan(null)}
              style={{
                background: plan.highlight 
                  ? `linear-gradient(135deg, ${colors.forestGreen} 0%, ${colors.darkGreen} 100%)` 
                  : `linear-gradient(135deg, ${colors.deepGreen} 0%, ${colors.charcoal} 100%)`,
                borderRadius: '24px',
                padding: '50px 36px',
                border: (plan.highlight || hoveredPlan === index) ? `4px solid ${colors.primary}` : `2px solid rgba(202, 151, 45, 0.2)`,
                transform: hoveredPlan === index ? 'translateY(-12px) scale(1.03)' : plan.highlight ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.4s ease',
                boxShadow: (plan.highlight || hoveredPlan === index) 
                  ? '0 16px 48px rgba(202, 151, 45, 0.4)' 
                  : '0 8px 24px rgba(0, 0, 0, 0.3)',
                cursor: 'pointer',
                position: 'relative',
                overflow: 'hidden'
              }}
            >
              <h3 style={{
                color: colors.primary,
                fontSize: '48px',
                fontFamily: "'Times New Roman', serif",
                marginBottom: '20px',
                fontWeight: '700',
                letterSpacing: '2px'
              }}>{plan.name}</h3>
              <h4 style={{
                color: colors.cream,
                fontSize: '36px',
                fontFamily: "'Times New Roman', serif",
                marginBottom: '40px',
                fontWeight: '600'
              }}>{plan.price}</h4>
              <div style={{ marginBottom: '50px' }}>
                {plan.features.map((feature, fIndex) => (
                  <p key={fIndex} style={{
                    color: colors.lightGold,
                    fontSize: '19px',
                    margin: '18px 0',
                    textAlign: 'left',
                    paddingLeft: '28px',
                    fontWeight: '500',
                    letterSpacing: '0.5px'
                  }}>✓ {feature}</p>
                ))}
              </div>
              {plan.showButton && (
                <Link to="/login">
                  <button style={{
                    background: hoveredPlan === index ? colors.lightGold : colors.primary,
                    border: 'none',
                    color: hoveredPlan === index ? colors.deepGreen : colors.charcoal,
                    padding: '18px 48px',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    borderRadius: '12px',
                    fontFamily: "'Times New Roman', serif",
                    transition: 'all 0.3s ease',
                    width: '100%',
                    letterSpacing: '1.5px',
                    boxShadow: hoveredPlan === index 
                      ? '0 8px 24px rgba(232, 189, 90, 0.5)' 
                      : '0 4px 12px rgba(202, 151, 45, 0.3)',
                    transform: hoveredPlan === index ? 'scale(1.02)' : 'scale(1)'
                  }}>SUBSCRIBE</button>
                </Link>
              )}
            </div>
          ))}
        </div>
      </section>
      
      {/* Personal Training Section */}
      <section id="personal-training" style={{
        background: `linear-gradient(135deg, ${colors.forestGreen} 0%, ${colors.darkGreen} 100%)`,
        padding: '100px 40px',
        textAlign: 'center',
        position: 'relative'
      }}>
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '800px',
          height: '800px',
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(202, 151, 45, 0.05) 0%, transparent 70%)`,
          pointerEvents: 'none'
        }}></div>

        <h2 style={{
          color: colors.primary,
          fontSize: '56px',
          fontFamily: "'Times New Roman', serif",
          marginBottom: '40px',
          fontWeight: '700',
          letterSpacing: '3px',
          textShadow: '3px 3px 6px rgba(0, 0, 0, 0.4)'
        }}>PERSONAL TRAINING</h2>
        <p style={{
          color: colors.cream,
          fontSize: '22px',
          lineHeight: '1.9',
          maxWidth: '1000px',
          margin: '0 auto',
          fontWeight: '300'
        }}>
          Our certified personal trainers are here to help you achieve your fitness goals. 
          Whether you're looking to build muscle, lose weight, or improve your overall health, 
          we have a trainer that's right for you.
        </p>
      </section>

      {/* Footer */}
      <section id="about" style={{
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        background: colors.deepGreen
      }}>
        <div style={{
          background: `linear-gradient(135deg, ${colors.forestGreen} 0%, ${colors.darkGreen} 100%)`,
          padding: '100px 60px',
          position: 'relative'
        }}>
          <h2 style={{
            color: colors.primary,
            fontSize: '52px',
            fontFamily: "'Times New Roman', serif",
            marginBottom: '40px',
            textAlign: 'center',
            fontWeight: '700',
            letterSpacing: '2px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>ABOUT US</h2>
          <p style={{
            color: colors.cream,
            fontSize: '20px',
            lineHeight: '1.9',
            textAlign: 'justify',
            fontWeight: '300'
          }}>
            Welcome to MEL Gym, where fitness meets community and transformation begins. We are dedicated to helping you 
            achieve your health and wellness goals through personalized training programs, state-of-the-art 
            equipment, and expert coaching from certified professionals. Whether you're a beginner just starting your fitness journey, 
            an experienced athlete looking to push your limits, or someone seeking to improve their overall health and lifestyle, our supportive 
            environment is designed to inspire and motivate you every step of the way. 
            <br /><br />
            At MEL Gym, we believe that fitness is not just about physical strength—it's about building confidence, 
            discipline, and mental resilience. Our team is committed to creating a welcoming space where everyone feels valued and supported, 
            regardless of their background or fitness level. With our comprehensive range of programs including group classes, personal training, 
            and specialized fitness solutions, we ensure that your goals are met with professional guidance and encouragement.
            <br /><br />
            Join us today and become part of our growing community of fitness enthusiasts. Let's work together to transform 
            your body, strengthen your mind, and elevate your lifestyle. Your fitness journey starts here at MEL Gym.
          </p>
        </div>
        
        <div style={{
          background: `linear-gradient(135deg, ${colors.darkGreen} 0%, ${colors.deepGreen} 100%)`,
          padding: '100px 60px'
        }}>
          <h2 style={{
            color: colors.primary,
            fontSize: '52px',
            fontFamily: "'Times New Roman', serif",
            marginBottom: '50px',
            textAlign: 'center',
            fontWeight: '700',
            letterSpacing: '2px',
            textShadow: '2px 2px 4px rgba(0, 0, 0, 0.3)'
          }}>CONTACT US</h2>
          
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '28px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {[
              { icon: <FaPhoneAlt />, label: 'Phone', value: '09738492328', link: 'tel:09738492328' },
              { icon: <FaEnvelope />, label: 'Email', value: 'melgarcia@gmail.com', link: 'mailto:melgarcia@gmail.com' },
              { icon: <FaMapMarkerAlt />, label: 'Address', value: 'Carmona, Cavite' },
              { icon: <FaClock />, label: 'Hours', value: 'Mon - Sun: 7:00 AM - 10:00 PM' }
            ].map((item, index) => (
              <div key={index} style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: '24px',
                padding: '24px',
                background: 'rgba(202, 151, 45, 0.08)',
                borderRadius: '16px',
                borderLeft: `5px solid ${colors.primary}`,
                transition: 'all 0.3s ease',
                boxShadow: '0 4px 12px rgba(0, 0, 0, 0.2)'
              }}>
                <div style={{
                  fontSize: '30px',
                  color: colors.primary,
                  minWidth: '45px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>{item.icon}</div>
                <div>
                  <span style={{
                    fontSize: '13px',
                    color: colors.silver,
                    textTransform: 'uppercase',
                    letterSpacing: '1.5px',
                    display: 'block',
                    marginBottom: '10px',
                    fontWeight: '600'
                  }}>{item.label}</span>
                  {item.link ? (
                    <a href={item.link} style={{
                      fontSize: '18px',
                      color: colors.cream,
                      textDecoration: 'none',
                      fontWeight: '500',
                      transition: 'color 0.3s ease'
                    }}>{item.value}</a>
                  ) : (
                    <div style={{
                      fontSize: '18px',
                      color: colors.cream,
                      fontWeight: '500',
                      whiteSpace: 'pre-line',
                      lineHeight: '1.7'
                    }}>{item.value}</div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Social Media Links */}
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '24px',
            marginTop: '60px',
            paddingTop: '40px',
            borderTop: `1px solid rgba(202, 151, 45, 0.3)`
          }}>
            {[
              { icon: <FaFacebookF />, link: 'https://www.facebook.com/mel.garcia.946954?rdid=fikwvaKuNyAI2N1f&share_url=https%3A%2F%2Fwww.facebook.com%2Fshare%2F17aRwzegvv%2F' }
            ].map((social, index) => (
              <a 
                key={index} 
                href={social.link} 
                target="_blank" 
                rel="noopener noreferrer"
                onMouseEnter={() => setHoveredSocial(index)}
                onMouseLeave={() => setHoveredSocial(null)}
                style={{
                  width: '56px',
                  height: '56px',
                  borderRadius: '50%',
                  background: hoveredSocial === index ? colors.primary : 'rgba(202, 151, 45, 0.12)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                  color: hoveredSocial === index ? colors.deepGreen : colors.primary,
                  textDecoration: 'none',
                  transition: 'all 0.4s ease',
                  border: `2px solid ${hoveredSocial === index ? colors.primary : 'transparent'}`,
                  transform: hoveredSocial === index ? 'translateY(-8px) scale(1.15)' : 'translateY(0)',
                  boxShadow: hoveredSocial === index ? '0 12px 28px rgba(202, 151, 45, 0.5)' : '0 4px 12px rgba(0, 0, 0, 0.2)'
                }}
              >{social.icon}</a>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}

export default Mainpage;
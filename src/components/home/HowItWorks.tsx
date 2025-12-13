import { UserPlus, Gamepad2, Trophy, Wallet } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Account',
    description: 'Sign up in seconds. Verify your phone and complete your gaming profile.',
    color: 'from-primary to-cyan-400',
  },
  {
    icon: Gamepad2,
    title: 'Join Tournaments',
    description: 'Browse tournaments for your favorite games. Pay entry fees and join the battle.',
    color: 'from-purple-500 to-pink-500',
  },
  {
    icon: Trophy,
    title: 'Compete & Win',
    description: 'Play matches, submit results, and climb the brackets to victory.',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Wallet,
    title: 'Get Paid',
    description: 'Withdraw your winnings instantly to Zain Cash, Orange Money, or bank transfer.',
    color: 'from-green-500 to-emerald-500',
  },
];

const HowItWorks = () => {
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="text-center mb-16">
          <h2 className="font-display text-3xl sm:text-4xl font-bold mb-4">
            How It <span className="text-gradient">Works</span>
          </h2>
          <p className="text-muted-foreground font-gaming max-w-2xl mx-auto">
            From registration to collecting your winnings - it's easier than you think
          </p>
        </div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <div 
              key={step.title}
              className="relative group animate-slide-up"
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              {/* Connector Line */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute top-12 left-[60%] w-full h-0.5 bg-gradient-to-r from-border to-transparent" />
              )}

              {/* Step Card */}
              <div className="relative p-6 rounded-2xl bg-card border border-border hover:border-primary/30 transition-all duration-300 hover-lift">
                {/* Step Number */}
                <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-muted border border-border flex items-center justify-center font-display font-bold text-sm">
                  {index + 1}
                </div>

                {/* Icon */}
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${step.color} flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform`}>
                  <step.icon className="w-8 h-8 text-white" />
                </div>

                {/* Content */}
                <h3 className="font-display font-semibold text-lg mb-2 group-hover:text-primary transition-colors">
                  {step.title}
                </h3>
                <p className="text-muted-foreground font-gaming text-sm">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
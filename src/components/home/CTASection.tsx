import { Link } from 'react-router-dom';
import { Zap, Trophy, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useTranslation } from 'react-i18next';

const CTASection = () => {
  const { t } = useTranslation();
  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="relative overflow-hidden rounded-3xl">
          {/* Background */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-secondary/20 to-primary/20" />
          <div className="absolute inset-0 bg-card/80 backdrop-blur-xl" />
          
          {/* Decorative Elements */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 rounded-full blur-[100px]" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-secondary/10 rounded-full blur-[100px]" />

          {/* Content */}
          <div className="relative p-8 sm:p-12 lg:p-16 text-center">
            <div className="inline-flex items-center space-x-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6">
              <Zap className="w-4 h-4 text-primary" />
              <span className="font-gaming text-sm text-primary">{t('home.cta.title')}</span>
            </div>

            <h2 className="font-display text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">
              {t('home.cta.subtitle').split('<span>').map((part: string, index: number) => {
                if (part.includes('</span>')) {
                  return (
                    <>
                      {part.replace('</span>', '')}
                      <span className="text-gradient">{part.replace('</span>', '')}</span>
                    </>
                  );
                }
                return part;
              })}
            </h2>

            <p className="text-muted-foreground font-gaming text-lg max-w-2xl mx-auto mb-8">
              {t('home.cta.description') || 'Create your free account and start competing in tournaments. Thousands of players are already battling for glory and prizes.'}
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/register">
                <Button size="lg" className="font-gaming text-lg px-8 py-6 bg-gradient-to-r from-primary to-cyan-400 hover:opacity-90 glow-cyan group">
                  <Trophy className="w-5 h-5 mr-2" />
                  {t('home.cta.button')}
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Link to="/tournaments">
                <Button size="lg" variant="outline" className="font-gaming text-lg px-8 py-6 border-border hover:border-primary/50 hover:bg-primary/5">
                  Browse Tournaments
                </Button>
              </Link>
            </div>

            {/* Trust Badges */}
            <div className="flex items-center justify-center gap-6 mt-12 pt-8 border-t border-border/50">
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-primary">Secure</div>
                <div className="font-gaming text-xs text-muted-foreground">Payments</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-secondary">24/7</div>
                <div className="font-gaming text-xs text-muted-foreground">Support</div>
              </div>
              <div className="w-px h-8 bg-border" />
              <div className="text-center">
                <div className="font-display text-2xl font-bold text-success">Instant</div>
                <div className="font-gaming text-xs text-muted-foreground">Payouts</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default CTASection;

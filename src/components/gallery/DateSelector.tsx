
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Calendar, ChevronLeft } from 'lucide-react';
import { 
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { useLanguage } from '@/hooks/use-language';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-breakpoint';

interface DateSelectorProps {
  years: number[];
  monthsByYear: Map<number, number[]>;
  onSelectYearMonth: (year: number, month: number) => void;
  position: 'source' | 'destination';
}

const DateSelector: React.FC<DateSelectorProps> = ({
  years,
  monthsByYear,
  onSelectYearMonth,
  position
}) => {
  const { t } = useLanguage();
  const [selectedYear, setSelectedYear] = useState<number | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [isVisible, setIsVisible] = useState(true);
  const inactivityTimerRef = useRef<number | null>(null);
  const isMobile = useIsMobile();

  // Gérer l'affichage du bouton en fonction de l'activité
  useEffect(() => {
    // Fonction pour afficher le bouton
    const showButton = () => {
      setIsVisible(true);
      
      // Réinitialiser le timer d'inactivité
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
      
      // Configurer un nouveau timer pour cacher le bouton après 3 secondes d'inactivité
      // Sur mobile, on garde toujours le bouton visible
      if (!isMobile) {
        inactivityTimerRef.current = window.setTimeout(() => {
          setIsVisible(false);
        }, 3000);
      }
    };
    
    // Afficher le bouton au chargement initial
    showButton();
    
    // Ajouter les écouteurs d'événements pour l'interaction utilisateur
    window.addEventListener('scroll', showButton);
    window.addEventListener('touchmove', showButton);
    window.addEventListener('mousemove', showButton);
    
    // Nettoyer les écouteurs d'événements lors du démontage
    return () => {
      window.removeEventListener('scroll', showButton);
      window.removeEventListener('touchmove', showButton);
      window.removeEventListener('mousemove', showButton);
      
      // Nettoyer le timer d'inactivité
      if (inactivityTimerRef.current !== null) {
        window.clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [isMobile]);

  const handleSelectYear = useCallback((year: number) => {
    setSelectedYear(year);
  }, []);

  const handleSelectMonth = useCallback((month: number) => {
    if (selectedYear !== null) {
      onSelectYearMonth(selectedYear, month);
      setIsOpen(false);
      setSelectedYear(null);
    }
  }, [selectedYear, onSelectYearMonth]);

  const handleBackToYears = useCallback(() => {
    setSelectedYear(null);
  }, []);

  const getMonthName = (month: number): string => {
    const monthNames = [
      t('january'), t('february'), t('march'), t('april'),
      t('may'), t('june'), t('july'), t('august'),
      t('september'), t('october'), t('november'), t('december')
    ];
    return monthNames[month - 1] || '';
  };

  // Styles de base pour le bouton
  const baseButtonClasses = "bg-background/80 backdrop-blur-sm border border-border/50 shadow-md hover:bg-background/90 z-50 transition-opacity duration-300";
  
  // Styles conditionnels selon le type d'appareil
  const buttonClasses = isMobile 
    ? `${baseButtonClasses} fixed ${position === 'source' ? 'left-4' : 'right-4'} bottom-4 opacity-100 w-12 h-12 flex items-center justify-center` 
    : `${baseButtonClasses} absolute bottom-2 right-2 ${isVisible ? 'opacity-100' : 'opacity-0'}`;

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button 
          variant="ghost" 
          size="icon" 
          className={buttonClasses}
          aria-label={t('select_date')}
        >
          <Calendar className={isMobile ? "h-6 w-6" : "h-5 w-5"} />
        </Button>
      </DrawerTrigger>
      <DrawerContent className="max-h-[85vh]">
        <DrawerHeader>
          <DrawerTitle className="flex items-center gap-2">
            {selectedYear !== null && (
              <Button variant="ghost" size="sm" onClick={handleBackToYears} className="p-1">
                <ChevronLeft className="h-5 w-5" />
              </Button>
            )}
            {selectedYear !== null
              ? `${selectedYear} - ${t('select_date')}`
              : t('select_date')}
          </DrawerTitle>
        </DrawerHeader>
        <div className="p-4 overflow-y-auto max-h-[70vh]">
          {selectedYear === null ? (
            <div className="grid grid-cols-3 gap-2">
              {years.map(year => (
                <Button 
                  key={year} 
                  variant="outline"
                  onClick={() => handleSelectYear(year)}
                  className="h-14"
                >
                  {year}
                </Button>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-3 gap-2">
              {monthsByYear.get(selectedYear)?.map(month => (
                <Button
                  key={month}
                  variant="outline"
                  onClick={() => handleSelectMonth(month)}
                  className="h-14"
                >
                  {getMonthName(month)}
                </Button>
              ))}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default DateSelector;

import { GiCrownCoin, GiTwoCoins, GiGoldBar, GiDiamondTrophy, GiCutDiamond } from 'react-icons/gi';

const TierBadge = ({ tier, size = 'sm', showLabel = true }) => {
  const getTierConfig = (tier) => {
    const configs = {
      bronze: {
        icon: GiCrownCoin,
        color: 'text-amber-700',
        bgColor: 'bg-amber-100',
        borderColor: 'border-amber-300',
        label: 'Bronze'
      },
      silver: {
        icon: GiTwoCoins,
        color: 'text-gray-400',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-300',
        label: 'Silver'
      },
      gold: {
        icon: GiGoldBar,
        color: 'text-yellow-500',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-300',
        label: 'Gold'
      },
      platinum: {
        icon: GiDiamondTrophy,
        color: 'text-cyan-400',
        bgColor: 'bg-cyan-100',
        borderColor: 'border-cyan-300',
        label: 'Platinum'
      },
      diamond: {
        icon: GiCutDiamond,
        color: 'text-blue-500',
        bgColor: 'bg-blue-100',
        borderColor: 'border-blue-300',
        label: 'Diamond'
      }
    };
    return configs[tier] || configs.bronze;
  };

  const config = getTierConfig(tier);
  const Icon = config.icon;

  const sizeClasses = {
    xs: 'text-xs px-1.5 py-0.5',
    sm: 'text-xs px-2 py-1',
    md: 'text-sm px-3 py-1.5',
    lg: 'text-base px-4 py-2'
  };

  const iconSizes = {
    xs: 12,
    sm: 14,
    md: 16,
    lg: 20
  };

  return (
    <span className={`inline-flex items-center gap-1 ${sizeClasses[size]} rounded-full font-medium border ${config.bgColor} ${config.color} ${config.borderColor}`}>
      <Icon size={iconSizes[size]} />
      {showLabel && <span>{config.label}</span>}
    </span>
  );
};

export default TierBadge;

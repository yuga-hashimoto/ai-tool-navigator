// =====================================================
// LOYALTY REWARDS CATALOG COMPONENT
// =====================================================

'use client';

import React, { useState, useMemo } from 'react';
import { useLoyaltyRewards } from '@/lib/loyalty/useLoyaltyRewards';
import { formatPoints, formatCurrency, REWARDS, LOYALTY_TIERS } from '@/lib/loyalty/loyalty-core';
import type { Reward, LoyaltyTier } from '@/lib/loyalty/loyalty-types';

interface RewardsCatalogProps {
  userPoints?: number;
  userTier?: LoyaltyTier;
  showFilters?: boolean;
  maxItems?: number;
}

type RewardCategory = 'all' | 'discount' | 'gift_card' | 'merchandise' | 'experience' | 'exclusive';
type SortOption = 'points_asc' | 'points_desc' | 'value_asc' | 'value_desc' | 'popular';

export function RewardsCatalog({ 
  userPoints = 0, 
  userTier = 'BRONZE',
  showFilters = true,
  maxItems
}: RewardsCatalogProps) {
  const [selectedCategory, setSelectedCategory] = useState<RewardCategory>('all');
  const [sortBy, setSortBy] = useState<SortOption>('popular');
  const [searchQuery, setSearchQuery] = useState('');
  const [showRedeemModal, setShowRedeemModal] = useState<string | null>(null);

  const tierOrder: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const userTierIndex = tierOrder.indexOf(userTier);

  const filteredRewards = useMemo(() => {
    let rewards = REWARDS.filter(r => r.isActive);

    // Filter by category
    if (selectedCategory !== 'all') {
      rewards = rewards.filter(r => r.category === selectedCategory);
    }

    // Filter by tier eligibility
    rewards = rewards.filter(r => {
      if (!r.tierRequirement) return true;
      const reqIndex = tierOrder.indexOf(r.tierRequirement as LoyaltyTier);
      return reqIndex <= userTierIndex;
    });

    // Filter by user points (optional - show all or only redeemable)
    // rewards = rewards.filter(r => userPoints >= r.pointsCost);

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      rewards = rewards.filter(r => 
        r.displayName.toLowerCase().includes(query) ||
        r.description.toLowerCase().includes(query)
      );
    }

    // Sort
    switch (sortBy) {
      case 'points_asc':
        rewards.sort((a, b) => a.pointsCost - b.pointsCost);
        break;
      case 'points_desc':
        rewards.sort((a, b) => b.pointsCost - a.pointsCost);
        break;
      case 'value_asc':
        rewards.sort((a, b) => a.monetaryValue - b.monetaryValue);
        break;
      case 'value_desc':
        rewards.sort((a, b) => b.monetaryValue - a.monetaryValue);
        break;
      case 'popular':
      default:
        rewards.sort((a, b) => (b.redemptionsRemaining || 0) - (a.redemptionsRemaining || 0));
        break;
    }

    if (maxItems) {
      rewards = rewards.slice(0, maxItems);
    }

    return rewards.map(r => ({
      ...r,
      id: r.name,
      createdAt: new Date(),
      updatedAt: new Date()
    })) as Reward[];
  }, [selectedCategory, sortBy, searchQuery, userTierIndex, maxItems, userPoints]);

  const categories: { key: RewardCategory; label: string; icon: string }[] = [
    { key: 'all', label: 'All Rewards', icon: '🎁' },
    { key: 'discount', label: 'Discounts', icon: '🏷️' },
    { key: 'gift_card', label: 'Gift Cards', icon: '💳' },
    { key: 'merchandise', label: 'Merchandise', icon: '👕' },
    { key: 'experience', label: 'Experiences', icon: '🎭' },
    { key: 'exclusive', label: 'Exclusive', icon: '⭐' }
  ];

  const totalValue = useMemo(() => 
    filteredRewards.reduce((sum, r) => sum + r.monetaryValue, 0),
    [filteredRewards]
  );

  return (
    <div className="rewards-catalog">
      {/* Header */}
      <div className="catalog-header">
        <h2>Rewards Catalog</h2>
        <div className="points-balance">
          <span className="balance-label">Your Balance:</span>
          <span className="balance-amount">{formatPoints(userPoints)} pts</span>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div className="catalog-filters">
          <div className="search-box">
            <input
              type="text"
              placeholder="Search rewards..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            <span className="search-icon">🔍</span>
          </div>

          <div className="category-tabs">
            {categories.map(cat => (
              <button
                key={cat.key}
                className={`category-tab ${selectedCategory === cat.key ? 'active' : ''}`}
                onClick={() => setSelectedCategory(cat.key)}
              >
                <span className="tab-icon">{cat.icon}</span>
                <span className="tab-label">{cat.label}</span>
              </button>
            ))}
          </div>

          <div className="sort-controls">
            <label>Sort by:</label>
            <select 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="sort-select"
            >
              <option value="popular">Most Popular</option>
              <option value="points_asc">Points: Low to High</option>
              <option value="points_desc">Points: High to Low</option>
              <option value="value_asc">Value: Low to High</option>
              <option value="value_desc">Value: High to Low</option>
            </select>
          </div>
        </div>
      )}

      {/* Results Count */}
      <div className="results-info">
        <span>{filteredRewards.length} rewards available</span>
        <span className="total-value">Total value: {formatCurrency(totalValue)}</span>
      </div>

      {/* Rewards Grid */}
      <div className="rewards-grid">
        {filteredRewards.map(reward => (
          <RewardCard 
            key={reward.name} 
            reward={reward} 
            userPoints={userPoints}
            userTier={userTier}
            onRedeem={() => setShowRedeemModal(reward.name)}
          />
        ))}
      </div>

      {/* Empty State */}
      {filteredRewards.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">🎁</div>
          <h3>No rewards found</h3>
          <p>Try adjusting your filters or search query</p>
        </div>
      )}

      {/* Redeem Confirmation Modal */}
      {showRedeemModal && (
        <RedeemModal 
          reward={{
            ...REWARDS.find(r => r.name === showRedeemModal)!,
            id: showRedeemModal,
            createdAt: new Date(),
            updatedAt: new Date()
          } as Reward}
          userPoints={userPoints}
          onClose={() => setShowRedeemModal(null)}
          onConfirm={() => {
            // Handle redemption
            setShowRedeemModal(null);
          }}
        />
      )}
    </div>
  );
}

// Individual Reward Card
interface RewardCardProps {
  reward: Reward;
  userPoints: number;
  userTier: LoyaltyTier;
  onRedeem: () => void;
}

function RewardCard({ reward, userPoints, userTier, onRedeem }: RewardCardProps) {
  const tierOrder: LoyaltyTier[] = ['BRONZE', 'SILVER', 'GOLD', 'PLATINUM', 'DIAMOND'];
  const userTierIndex = tierOrder.indexOf(userTier);
  const reqIndex = reward.tierRequirement ? tierOrder.indexOf(reward.tierRequirement as LoyaltyTier) : 0;
  const isEligible = reqIndex <= userTierIndex;
  const canRedeem = userPoints >= reward.pointsCost && isEligible;
  
  const valuePerPoint = reward.monetaryValue / reward.pointsCost * 100;
  
  return (
    <div className={`reward-card ${!canRedeem ? 'locked' : ''} ${reward.isFeatured ? 'featured' : ''}`}>
      {reward.isFeatured && <span className="featured-badge">Featured</span>}
      
      <div className="reward-image">
        {reward.category === 'discount' && '🏷️'}
        {reward.category === 'gift_card' && '💳'}
        {reward.category === 'merchandise' && '👕'}
        {reward.category === 'experience' && '🎭'}
        {reward.category === 'exclusive' && '⭐'}
      </div>
      
      <div className="reward-content">
        <div className="reward-header">
          <span className={`category-badge ${reward.category}`}>
            {reward.category.replace('_', ' ')}
          </span>
          {reward.tierRequirement && (
            <span className="tier-badge">{reward.tierRequirement}</span>
          )}
        </div>
        
        <h3 className="reward-title">{reward.displayName}</h3>
        <p className="reward-description">{reward.description}</p>
        
        <div className="reward-value-breakdown">
          <div className="value-item">
            <span className="value-label">Points</span>
            <span className="value-amount points">{formatPoints(reward.pointsCost)}</span>
          </div>
          <div className="value-item">
            <span className="value-label">Value</span>
            <span className="value-amount">{formatCurrency(reward.monetaryValue)}</span>
          </div>
          <div className="value-item">
            <span className="value-label">Efficiency</span>
            <span className="value-amount">{valuePerPoint.toFixed(1)}¢/pt</span>
          </div>
        </div>
        
        {reward.discountType === 'percentage' && reward.discountValue && (
          <div className="discount-badge">
            {reward.discountValue}% OFF
          </div>
        )}
        
        {reward.validDays && (
          <div className="validity-info">
            Valid for {reward.validDays} days after redemption
          </div>
        )}
        
        {reward.perUserLimit && (
          <div className="limit-info">
            Max {reward.perUserLimit} per user
          </div>
        )}
        
        {!isEligible && (
          <div className="tier-lock">
            <span className="lock-icon">🔒</span>
            Requires {reward.tierRequirement} tier
          </div>
        )}
        
        {isEligible && !canRedeem && (
          <div className="points-shortfall">
            Need {formatPoints(reward.pointsCost - userPoints)} more points
          </div>
        )}
      </div>
      
      <div className="reward-actions">
        <button
          className={`redeem-btn ${canRedeem ? 'available' : 'disabled'}`}
          onClick={onRedeem}
          disabled={!canRedeem}
        >
          {canRedeem ? 'Redeem' : 'Locked'}
        </button>
        
        {reward.redemptionsRemaining !== undefined && (
          <span className="stock-info">
            {reward.redemptionsRemaining} left
          </span>
        )}
      </div>
    </div>
  );
}

// Redeem Modal
interface RedeemModalProps {
  reward: Reward;
  userPoints: number;
  onClose: () => void;
  onConfirm: () => void;
}

function RedeemModal({ reward, userPoints, onClose, onConfirm }: RedeemModalProps) {
  const [isConfirming, setIsConfirming] = useState(false);
  const canRedeem = userPoints >= reward.pointsCost;

  const handleConfirm = async () => {
    setIsConfirming(true);
    try {
      const response = await fetch('/api/loyalty/redeem', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rewardId: reward.id })
      });
      
      if (response.ok) {
        onConfirm();
      } else {
        const error = await response.json();
        alert(error.message || 'Redemption failed');
      }
    } catch (error) {
      alert('An error occurred. Please try again.');
    } finally {
      setIsConfirming(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="redeem-modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose}>×</button>
        
        <div className="modal-header">
          <h2>Confirm Redemption</h2>
        </div>
        
        <div className="modal-body">
          <div className="reward-preview">
            <div className="reward-icon">
              {reward.category === 'discount' && '🏷️'}
              {reward.category === 'gift_card' && '💳'}
              {reward.category === 'merchandise' && '👕'}
              {reward.category === 'experience' && '🎭'}
              {reward.category === 'exclusive' && '⭐'}
            </div>
            <h3>{reward.displayName}</h3>
            <p>{reward.description}</p>
          </div>
          
          <div className="redemption-details">
            <div className="detail-row">
              <span>Cost:</span>
              <span className="cost">{formatPoints(reward.pointsCost)} points</span>
            </div>
            <div className="detail-row">
              <span>Your Balance:</span>
              <span className={canRedeem ? 'positive' : 'negative'}>
                {formatPoints(userPoints)} points
              </span>
            </div>
            <div className="detail-row">
              <span>After Redemption:</span>
              <span className={canRedeem ? 'positive' : 'negative'}>
                {formatPoints(userPoints - reward.pointsCost)} points
              </span>
            </div>
            <div className="detail-row highlight">
              <span>Value:</span>
              <span>{formatCurrency(reward.monetaryValue)}</span>
            </div>
          </div>
          
          {reward.code && (
            <div className="code-info">
              <span className="code-label">Redemption Code:</span>
              <code>{reward.code}</code>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="cancel-btn" onClick={onClose} disabled={isConfirming}>
            Cancel
          </button>
          <button 
            className="confirm-btn" 
            onClick={handleConfirm}
            disabled={!canRedeem || isConfirming}
          >
            {isConfirming ? 'Processing...' : 'Confirm Redemption'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default RewardsCatalog;

import React, { useEffect, useState } from 'react';
import { User, Gift, Star, Trophy, Calendar, ShoppingBag, Edit, Save, X } from 'lucide-react';
import { useStore } from '../store/useStore';
import { db, auth } from '../lib/supabase';
import { Button } from '../components/ui/Button';
import { Footer } from '../components/ui/Footer';
import { UserReward, Achievement } from '../types';

const ProfilePage: React.FC = () => {
  const { user, language, setUser, rewards, setRewards } = useStore();
  const [userRewards, setUserRewards] = useState<UserReward[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    full_name: user?.full_name || '',
    phone: user?.phone || '',
    address: user?.address || '',
  });
  const [loading, setLoading] = useState(true);

  const translations = {
    en: {
      profile: 'My Profile',
      personalInfo: 'Personal Information',
      loyaltyProgram: 'Loyalty Program',
      rewards: 'My Rewards',
      achievements: 'Achievements',
      edit: 'Edit Profile',
      save: 'Save Changes',
      cancel: 'Cancel',
      fullName: 'Full Name',
      email: 'Email',
      phone: 'Phone Number',
      address: 'Address',
      memberSince: 'Member Since',
      totalOrders: 'Total Orders',
      totalSpent: 'Total Spent',
      loyaltyPoints: 'Loyalty Points',
      currentLevel: 'Current Level',
      nextLevel: 'Next Level',
      pointsToNext: 'Points to Next Level',
      claimReward: 'Claim Reward',
      claimed: 'Claimed',
      expires: 'Expires',
      noRewards: 'No rewards available',
      noAchievements: 'No achievements unlocked yet',
      logout: 'Logout',
      loginStreak: 'Login Streak',
      days: 'days',
    },
    fr: {
      profile: 'Mon Profil',
      personalInfo: 'Informations Personnelles',
      loyaltyProgram: 'Programme de Fidélité',
      rewards: 'Mes Récompenses',
      achievements: 'Réalisations',
      edit: 'Modifier le Profil',
      save: 'Enregistrer',
      cancel: 'Annuler',
      fullName: 'Nom Complet',
      email: 'E-mail',
      phone: 'Numéro de Téléphone',
      address: 'Adresse',
      memberSince: 'Membre Depuis',
      totalOrders: 'Commandes Totales',
      totalSpent: 'Total Dépensé',
      loyaltyPoints: 'Points de Fidélité',
      currentLevel: 'Niveau Actuel',
      nextLevel: 'Niveau Suivant',
      pointsToNext: 'Points pour le Niveau Suivant',
      claimReward: 'Réclamer la Récompense',
      claimed: 'Réclamé',
      expires: 'Expire',
      noRewards: 'Aucune récompense disponible',
      noAchievements: 'Aucune réalisation débloquée',
      logout: 'Déconnexion',
      loginStreak: 'Série de Connexions',
      days: 'jours',
    }
  };

  const t = translations[language];

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      
      // Load user rewards
      const { data: rewardsData } = await db.getUserRewards(user.id);
      if (rewardsData) {
        setUserRewards(rewardsData);
        setRewards(rewardsData);
      }

      // Load achievements
      const { data: achievementsData } = await db.getAchievements();
      if (achievementsData) {
        setAchievements(achievementsData);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!user) return;

    try {
      const { data: updatedProfile } = await db.updateProfile(user.id, editForm);
      if (updatedProfile) {
        setUser(updatedProfile);
        setIsEditing(false);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
    }
  };

  const handleClaimReward = async (rewardId: string) => {
    try {
      await db.claimReward(rewardId);
      
      // Update local state
      setUserRewards(prev => 
        prev.map(reward => 
          reward.id === rewardId ? { ...reward, claimed: true } : reward
        )
      );
    } catch (error) {
      console.error('Error claiming reward:', error);
    }
  };

  const handleLogout = async () => {
    await auth.signOut();
  };

  const getLoyaltyLevel = (points: number) => {
    if (points >= 10000) return { level: 'Diamond', next: null, pointsToNext: 0 };
    if (points >= 5000) return { level: 'Gold', next: 'Diamond', pointsToNext: 10000 - points };
    if (points >= 2000) return { level: 'Silver', next: 'Gold', pointsToNext: 5000 - points };
    return { level: 'Bronze', next: 'Silver', pointsToNext: 2000 - points };
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'Diamond': return 'text-purple-600 bg-purple-100';
      case 'Gold': return 'text-yellow-600 bg-yellow-100';
      case 'Silver': return 'text-gray-600 bg-gray-100';
      default: return 'text-orange-600 bg-orange-100';
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Please Login</h1>
          <p className="text-gray-600">You need to be logged in to view your profile.</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  const loyaltyInfo = getLoyaltyLevel(user.loyalty_points || 0);

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">{t.profile}</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Personal Information */}
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{t.personalInfo}</h2>
                {!isEditing ? (
                  <Button
                    onClick={() => setIsEditing(true)}
                    variant="ghost"
                    size="sm"
                    className="flex items-center space-x-2"
                  >
                    <Edit className="w-4 h-4" />
                    <span>{t.edit}</span>
                  </Button>
                ) : (
                  <div className="flex space-x-2">
                    <Button
                      onClick={handleSaveProfile}
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <Save className="w-4 h-4" />
                      <span>{t.save}</span>
                    </Button>
                    <Button
                      onClick={() => setIsEditing(false)}
                      variant="ghost"
                      size="sm"
                      className="flex items-center space-x-2"
                    >
                      <X className="w-4 h-4" />
                      <span>{t.cancel}</span>
                    </Button>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.fullName}
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={editForm.full_name}
                      onChange={(e) => setEditForm({...editForm, full_name: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.full_name || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.email}
                  </label>
                  <p className="text-gray-900">{user.email}</p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.phone}
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={editForm.phone}
                      onChange={(e) => setEditForm({...editForm, phone: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.phone || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.memberSince}
                  </label>
                  <p className="text-gray-900">
                    {new Date(user.created_at).toLocaleDateString()}
                  </p>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    {t.address}
                  </label>
                  {isEditing ? (
                    <textarea
                      value={editForm.address}
                      onChange={(e) => setEditForm({...editForm, address: e.target.value})}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                    />
                  ) : (
                    <p className="text-gray-900">{user.address || 'Not provided'}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Rewards Section */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{t.rewards}</h2>
              
              {/* Rewards Summary */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Total Points</p>
                      <p className="text-2xl font-bold">{user?.loyalty_points || 0}</p>
                    </div>
                    <Star className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-green-400 to-green-500 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Claimed Rewards</p>
                      <p className="text-2xl font-bold">{userRewards.filter(r => r.claimed).length}</p>
                    </div>
                    <Gift className="w-8 h-8 opacity-80" />
                  </div>
                </div>
                
                <div className="bg-gradient-to-r from-purple-400 to-purple-500 text-white p-4 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm opacity-90">Available Rewards</p>
                      <p className="text-2xl font-bold">{userRewards.filter(r => !r.claimed).length}</p>
                    </div>
                    <Trophy className="w-8 h-8 opacity-80" />
                  </div>
                </div>
              </div>
              
              {userRewards.length === 0 ? (
                <div className="text-center py-12">
                  <Gift className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500 text-lg">{t.noRewards}</p>
                  <p className="text-gray-400 text-sm mt-2">Start shopping to earn rewards!</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {userRewards.map((reward) => (
                    <div
                      key={reward.id}
                      className={`p-4 rounded-lg border ${
                        reward.claimed ? 'bg-gray-50 border-gray-200' : 'bg-green-50 border-green-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-full ${
                            reward.claimed ? 'bg-gray-200' : 'bg-green-200'
                          }`}>
                            <Gift className={`w-5 h-5 ${
                              reward.claimed ? 'text-gray-600' : 'text-green-600'
                            }`} />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900">{reward.title}</h3>
                            <p className="text-sm text-gray-600">{reward.description}</p>
                            <div className="flex items-center space-x-4 mt-1">
                              <span className="text-sm font-medium text-green-600">
                                +{reward.points} points
                              </span>
                              {reward.expires_at && (
                                <span className="text-xs text-gray-500">
                                  {t.expires}: {new Date(reward.expires_at).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        
                        {!reward.claimed ? (
                          <Button
                            onClick={() => handleClaimReward(reward.id)}
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                          >
                            {t.claimReward}
                          </Button>
                        ) : (
                          <span className="text-sm text-gray-500 font-medium">{t.claimed}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            {/* Loyalty Program */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">{t.loyaltyProgram}</h2>
              
              <div className="text-center mb-6">
                <div className={`inline-flex items-center px-4 py-2 rounded-full ${getLevelColor(loyaltyInfo.level)}`}>
                  <Star className="w-5 h-5 mr-2" />
                  <span className="font-bold">{loyaltyInfo.level}</span>
                </div>
              </div>

              <div className="space-y-4">
                <div className="text-center">
                  <div className="text-3xl font-bold text-green-600 mb-1">
                    {user.loyalty_points || 0}
                  </div>
                  <div className="text-sm text-gray-600">{t.loyaltyPoints}</div>
                </div>

                {loyaltyInfo.next && (
                  <div>
                    <div className="flex justify-between text-sm text-gray-600 mb-2">
                      <span>{t.nextLevel}: {loyaltyInfo.next}</span>
                      <span>{loyaltyInfo.pointsToNext} points</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${Math.max(10, ((user.loyalty_points || 0) / (loyaltyInfo.pointsToNext + (user.loyalty_points || 0))) * 100)}%`
                        }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Stats */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Statistics</h2>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <ShoppingBag className="w-5 h-5 text-blue-600" />
                    <span className="text-gray-700">{t.totalOrders}</span>
                  </div>
                  <span className="font-semibold text-gray-900">{user.total_orders || 0}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Trophy className="w-5 h-5 text-yellow-600" />
                    <span className="text-gray-700">{t.totalSpent}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {(user.total_spent || 0).toLocaleString()} FCFA
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-5 h-5 text-green-600" />
                    <span className="text-gray-700">{t.loginStreak}</span>
                  </div>
                  <span className="font-semibold text-gray-900">
                    {user.login_streak || 0} {t.days}
                  </span>
                </div>
              </div>
            </div>

            {/* Logout Button */}
            <Button
              onClick={handleLogout}
              variant="ghost"
              className="w-full text-red-600 hover:text-red-700 hover:bg-red-50"
            >
              {t.logout}
            </Button>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ProfilePage;
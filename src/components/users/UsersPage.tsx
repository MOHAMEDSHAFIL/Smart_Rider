import React, { useState } from 'react';
import { 
  Users, 
  UserPlus, 
  Search, 
  Trash2, 
  KeyRound, 
  Ban, 
  ShieldCheck, 
  CheckCircle, 
  XCircle,
  Filter
} from 'lucide-react';
import { useSmartRider } from '../../context/SmartRiderContext';
import { Panel } from '../common/Panel';
import { Badge } from '../common/Badge';
import { AddUserModal } from './AddUserModal';
import { HonestLabel } from '../common/HonestLabel';
import { UserProfile } from '../../types';
import { sounds } from '../../utils/audio';

export const UsersPage: React.FC = () => {
  const { users, removeUser, grantTemporaryAccess, revokeAccess, activeRole } = useSmartRider();
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');

  const filteredUsers = users.filter(user => {
    const matchesSearch = 
      user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.licenceNumber.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterType === 'ALL') return matchesSearch;
    if (filterType === 'LEARNER') return matchesSearch && user.riderType === 'LEARNER';
    if (filterType === 'NORMAL') return matchesSearch && user.riderType === 'NORMAL';
    if (filterType === 'TEMPORARY') return matchesSearch && user.authType === 'TEMPORARY';
    return matchesSearch;
  });

  const getRiderTypeBadge = (type: UserProfile['riderType']) => {
    if (type === 'NORMAL') return <Badge variant="green" size="xs">NORMAL</Badge>;
    if (type === 'LEARNER') return <Badge variant="amber" size="xs">LEARNER</Badge>;
    return <Badge variant="red" size="xs">INVALID</Badge>;
  };

  const getAuthBadge = (auth: UserProfile['authType']) => {
    if (auth === 'OWNER') return <Badge variant="green" size="xs">OWNER</Badge>;
    if (auth === 'PERMANENT') return <Badge variant="green" size="xs">PERMANENT</Badge>;
    if (auth === 'TEMPORARY') return <Badge variant="blue" size="xs">TEMP (24H)</Badge>;
    return <Badge variant="red" size="xs">NONE / REVOKED</Badge>;
  };

  const getStatusBadge = (status: UserProfile['status']) => {
    if (status === 'ACTIVE') return <Badge variant="green" size="xs">ACTIVE</Badge>;
    if (status === 'PENDING_APPROVAL') return <Badge variant="amber" size="xs">PENDING</Badge>;
    return <Badge variant="red" size="xs">REVOKED</Badge>;
  };

  return (
    <div className="space-y-6">
      
      {/* Top Controls Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 p-4 rounded-lg dark:bg-[#0C1511] bg-white panel-border">
        
        {/* Search Input & Filter */}
        <div className="flex items-center gap-3 flex-1 max-w-lg">
          <div className="relative flex-1">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, ID, or licence number..."
              className="w-full pl-9 pr-3 py-1.5 rounded bg-black/30 border dark:border-slate-800 border-slate-300 dark:text-white text-slate-900 text-xs font-mono focus:outline-none focus:border-crt-green"
            />
          </div>

          <select
            value={filterType}
            onChange={e => setFilterType(e.target.value)}
            className="px-3 py-1.5 rounded bg-black/30 border dark:border-slate-800 border-slate-300 dark:text-slate-300 text-slate-700 text-xs font-mono focus:outline-none focus:border-crt-green"
          >
            <option value="ALL">All Roles</option>
            <option value="NORMAL">Normal Riders</option>
            <option value="LEARNER">Learners</option>
            <option value="TEMPORARY">Temporary Passes</option>
          </select>
        </div>

        {/* Action Button */}
        {activeRole === 'OWNER_ADMIN' && (
          <button
            onClick={() => {
              sounds.playClick(600);
              setIsAddModalOpen(true);
            }}
            className="flex items-center justify-center gap-2 px-4 py-2 rounded bg-crt-green hover:bg-emerald-400 text-crt-dark text-xs font-mono font-bold shadow-[0_0_12px_rgba(57,255,136,0.3)] transition-all flex-shrink-0"
          >
            <UserPlus className="w-4 h-4" />
            <span>Add Permanent User</span>
          </button>
        )}
      </div>

      {/* Authorized Users Table Panel */}
      <Panel
        title={`Vehicle Access Control Roster (${filteredUsers.length} Users Registered)`}
        icon={<Users className="w-4 h-4" />}
        footer={<HonestLabel type="credential" />}
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left font-mono text-xs border-collapse">
            <thead>
              <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-400 text-[11px] uppercase tracking-wider dark:bg-[#070D0A] bg-slate-50">
                <th className="py-3 px-4">User Details</th>
                <th className="py-3 px-4">User ID</th>
                <th className="py-3 px-4">Rider Type</th>
                <th className="py-3 px-4">Licence Credential</th>
                <th className="py-3 px-4">Authorization</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Verified</th>
                {activeRole === 'OWNER_ADMIN' && <th className="py-3 px-4 text-right">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800/60 divide-slate-100">
              {filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No authorized users match the specified search or filter criteria.
                  </td>
                </tr>
              ) : (
                filteredUsers.map(user => (
                  <tr
                    key={user.id}
                    className="hover:dark:bg-white/5 hover:bg-slate-50 transition-colors"
                  >
                    {/* User Name & Photo */}
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={user.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80"}
                          alt={user.name}
                          className="w-8 h-8 rounded-full object-cover border dark:border-slate-700 border-slate-200"
                        />
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white flex items-center gap-1.5">
                            <span>{user.name}</span>
                            {user.isOwner && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-emerald-500/20 text-crt-green font-bold">
                                OWNER
                              </span>
                            )}
                          </div>
                          {user.temporaryAccessExpiry && (
                            <div className="text-[10px] text-amber-500">
                              Expires: {user.temporaryAccessExpiry}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* ID */}
                    <td className="py-3 px-4 text-slate-400 font-bold">
                      {user.id}
                    </td>

                    {/* Rider Type */}
                    <td className="py-3 px-4">
                      {getRiderTypeBadge(user.riderType)}
                    </td>

                    {/* Licence Status */}
                    <td className="py-3 px-4">
                      <div className="space-y-0.5">
                        <div className="font-bold text-slate-700 dark:text-slate-300">{user.licenceNumber}</div>
                        <div className="text-[10px]">
                          {user.licenceStatus === 'VALID' ? (
                            <span className="text-crt-green flex items-center gap-1">
                              <CheckCircle className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="text-rose-500 flex items-center gap-1">
                              <XCircle className="w-3 h-3" /> {user.licenceStatus}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Auth Type */}
                    <td className="py-3 px-4">
                      {getAuthBadge(user.authType)}
                    </td>

                    {/* Status */}
                    <td className="py-3 px-4">
                      {getStatusBadge(user.status)}
                    </td>

                    {/* Last Verified */}
                    <td className="py-3 px-4 text-slate-400 text-[11px]">
                      {user.lastVerified}
                    </td>

                    {/* Row Actions */}
                    {activeRole === 'OWNER_ADMIN' && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Grant/Extend Temp Pass */}
                          <button
                            onClick={() => grantTemporaryAccess(user.id, 24)}
                            title="Grant/Extend 24-Hour Temporary Pass"
                            className="p-1.5 rounded dark:hover:bg-blue-950/40 hover:bg-blue-50 text-slate-400 hover:text-crt-blue border dark:border-slate-800 border-slate-200 transition-colors"
                          >
                            <KeyRound className="w-3.5 h-3.5" />
                          </button>

                          {/* Revoke Pass */}
                          {user.status !== 'REVOKED' && !user.isOwner && (
                            <button
                              onClick={() => revokeAccess(user.id)}
                              title="Revoke Vehicle Access Immediately"
                              className="p-1.5 rounded dark:hover:bg-amber-950/40 hover:bg-amber-50 text-slate-400 hover:text-amber-400 border dark:border-slate-800 border-slate-200 transition-colors"
                            >
                              <Ban className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Delete */}
                          {!user.isOwner && (
                            <button
                              onClick={() => removeUser(user.id)}
                              title="Remove User from Vehicle Registry"
                              className="p-1.5 rounded dark:hover:bg-rose-950/40 hover:bg-rose-50 text-slate-400 hover:text-rose-400 border dark:border-slate-800 border-slate-200 transition-colors"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Panel>

      {/* Modal */}
      <AddUserModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} />

    </div>
  );
};

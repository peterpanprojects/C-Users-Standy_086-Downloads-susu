import React, { useState, useMemo } from 'react';
import { useSusu } from '../../context/SusuContext';
import { Send, Users, MessageCircle } from 'lucide-react';

export const AgentMessaging: React.FC = () => {
  const { groups, members, agentMessages, sendAgentMessage } = useSusu() as any;
  const [selectedGroupId, setSelectedGroupId] = useState(groups[0]?.id || '');
  const [selectedMemberId, setSelectedMemberId] = useState('all');
  const [text, setText] = useState('');

  const groupMembers = useMemo(() => members.filter((m: any) => m.groupId === selectedGroupId), [members, selectedGroupId]);
  const filteredMessages = useMemo(() => agentMessages.filter((m: any) => m.groupId === selectedGroupId).slice(0, 50), [agentMessages, selectedGroupId]);

  const handleSend = () => {
    if (!text.trim() ||!selectedGroupId) return;
    sendAgentMessage(selectedGroupId, selectedMemberId, text.trim());
    setText('');
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="bg-white rounded-2xl p-4 border border-slate-100">
        <h3 className="font-bold flex items-center gap-2 mb-3"><Users size={18}/> My Groups</h3>
        <select value={selectedGroupId} onChange={e => setSelectedGroupId(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 mb-4">
          {groups.map((g: any) => <option key={g.id} value={g.id}>{g.name}</option>)}
        </select>
        <div className="space-y-1">
          <button onClick={() => setSelectedMemberId('all')} className={`w-full text-left p-3 rounded-xl ${selectedMemberId==='all'?'bg-indigo-50 text-indigo-700':'hover:bg-slate-50'}`}>📢 Broadcast to All ({groupMembers.length})</button>
          {groupMembers.map((m: any) => (
            <button key={m.id} onClick={() => setSelectedMemberId(m.id)} className={`w-full text-left p-3 rounded-xl flex justify-between ${selectedMemberId===m.id?'bg-indigo-50 text-indigo-700':'hover:bg-slate-50'}`}>
              <span>{m.name}</span><span className="text-xs text-slate-400">{m.uniqueCode}</span>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 flex flex-col h-[520px]">
        <div className="p-4 border-b border-slate-100 flex justify-between">
          <h3 className="font-bold flex items-center gap-2"><MessageCircle size={18}/> {selectedMemberId==='all'? 'Broadcast to all' : groupMembers.find((m: any)=>m.id===selectedMemberId)?.name}</h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-slate-50/50">
          {filteredMessages.length===0? <div className="text-center text-slate-400 mt-20">No messages yet.</div> :
            [...filteredMessages].reverse().map((msg: any) => (
              <div key={msg.id} className="bg-white p-3 rounded-2xl shadow-sm border max-w-[85%] ml-auto">
                <div className="text-sm">{msg.message}</div>
                <div className="text-[11px] text-slate-400 mt-1">{new Date(msg.createdAt).toLocaleString()} • {msg.memberId==='all'?'All':members.find((m: any)=>m.id===msg.memberId)?.name}</div>
              </div>
            ))
          }
        </div>
        <div className="p-3 border-t flex gap-2">
          <input value={text} onChange={e=>setText(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()} placeholder="Type a message..." className="flex-1 p-3 rounded-xl border border-slate-200"/>
          <button onClick={handleSend} className="bg-indigo-600 text-white p-3 rounded-xl"><Send size={18}/></button>
        </div>
      </div>
    </div>
  );
};
import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GamePhase, RoomType, PlayerState, LogEntry, Item, FloorData, DialogData, Entity, Achievement } from './types';
import { FLOORS, ITEMS_DB, INITIAL_TIME_MINUTES, DEADLINE_MINUTES, RUMOR_TEXTS, ACHIEVEMENTS_DB } from './constants';
import { audio } from './services/audioService';
import { 
  Heart, Clock, Search, DoorOpen, Briefcase, FileText, Lock, Box,
  Volume2, VolumeX, ShoppingCart, Award, AlertTriangle, FileWarning, Eye
} from 'lucide-react';

// --- Components ---

const SplashScreen = ({ onComplete }: { onComplete: () => void }) => {
    useEffect(() => {
        const timer = setTimeout(onComplete, 5000);
        return () => clearTimeout(timer);
    }, [onComplete]);

    return (
        <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden z-[100] cursor-none select-none">
            <div className="flex flex-col items-center animate-fade-in duration-1000">
                <h1 className="text-5xl md:text-8xl font-serif font-black text-[#8a1c1c] tracking-tighter drop-shadow-2xl mb-4">
                    诡异医院<span className="text-3xl md:text-5xl align-top ml-4 text-[#5a0c0c] font-light">: 5点钟声</span>
                </h1>
                <h2 className="text-sm md:text-xl font-serif text-[#444] tracking-[0.8em] uppercase font-light mt-6">
                    The-Hospital-At-Five
                </h2>
            </div>
            <div className="absolute bottom-12 text-[10px] md:text-xs text-[#333] tracking-widest font-mono opacity-60">
                游戏内有文字以及图片恐怖元素，无冲击性画面，请谨慎游玩。
            </div>
        </div>
    );
};

const AchievementPopup = ({ achievement }: { achievement: Achievement }) => (
    <div className="fixed top-24 right-4 z-[200] animate-slide-in-right glass-panel border-l-4 border-yellow-500 p-4 w-64">
        <div className="flex items-center gap-2 text-yellow-500 mb-1">
            <Award size={18} />
            <span className="font-bold text-sm uppercase tracking-wider">解锁成就</span>
        </div>
        <div className="text-white font-serif font-bold">{achievement.title}</div>
        <div className="text-xs text-zinc-400 mt-1">{achievement.description}</div>
        <div className="text-xs text-yellow-600 mt-2 font-mono">+ {achievement.rewardGold} GOLD</div>
    </div>
);

const PlayerSprite = ({ facing }: { facing: 'left' | 'right' }) => (
  <svg width="60" height="120" viewBox="0 0 60 120" className={`transform transition-transform duration-200 ${facing === 'left' ? 'scale-x-[-1]' : ''}`}>
    <path d="M45 45 L250 -40 L250 140 Z" fill="url(#flashlight-grad)" opacity="0.6" className="mix-blend-overlay" />
    <defs>
      <linearGradient id="flashlight-grad" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stopColor="rgba(255,255,255,0.4)" />
        <stop offset="100%" stopColor="rgba(0,0,0,0)" />
      </linearGradient>
    </defs>
    <g filter="drop-shadow(0 0 5px rgba(0,0,0,0.8))">
      <rect x="20" y="70" width="8" height="50" fill="#0a0a0a" />
      <rect x="32" y="70" width="8" height="50" fill="#0a0a0a" />
      <rect x="15" y="35" width="30" height="40" rx="2" fill="#3f1a1a" stroke="#000" />
      <circle cx="30" cy="20" r="12" fill="#888" />
    </g>
  </svg>
);

const CinematicIntro = ({ onComplete }: { onComplete: () => void }) => {
    const [page, setPage] = useState(0);
    
    // Exact text preserved as per requirements
    const pages = [
        <div className="space-y-8 text-center max-w-3xl">
            <h1 className="text-3xl text-red-900 font-serif font-black tracking-widest mb-8">下午五点的钟声</h1>
            <div className="space-y-4 text-lg text-zinc-300 font-serif leading-loose text-left border-l-2 border-red-900/30 pl-8">
                <p>当下午五点的钟声响起，医院的规则将会改变——而你，已经错过了剩下的时间。</p>
                <p>你记得自己是来看病的。</p>
                <p>妈妈接了个电话，说马上回来。</p>
                <p>然后门锁上了。</p>
                <p>柜台上出现了一张不属于这里的纸条：</p>
                <p className="text-red-500 italic">“欢迎来到诡异医院。请在下午5点前找到厕所并进入。”</p>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-600 font-mono mt-8 text-left pl-8">
                <div>- 一把生锈的手枪</div>
                <div>- 一个硬面包</div>
                <div>- 一瓶浑浊的水</div>
                <div>- 一个永远指向4:30的时钟</div>
            </div>
        </div>,
        <div className="space-y-8 text-center max-w-3xl font-serif text-left">
            <h1 className="text-3xl text-zinc-100 font-bold mb-8 text-center">你将面临什么</h1>
            <div className="space-y-2">
                <h3 className="text-xl text-red-800 font-bold">时间，是你的第一个敌人</h3>
                <p className="text-zinc-500 text-sm">每60秒，医院时间前进1分钟。下午5点是分界线——之前是医院，之后是地狱。</p>
                <p className="text-zinc-500 text-sm">5点前必须进入厕所隔间，但隔间里真的安全吗？</p>
            </div>
            <div className="space-y-2 mt-6">
                <h3 className="text-xl text-red-800 font-bold">医生，不再是救你的人</h3>
                <p className="text-zinc-500 text-sm">他们穿着白大褂，但口罩下没有脸。</p>
                <p className="text-zinc-500 text-sm">走廊里回荡着他们的脚步声——<span className="text-zinc-300">橡胶底与瓷砖的摩擦声</span>。</p>
                <p className="text-zinc-500 text-sm">遇到时，你有两个选择：攻击（成功率50%）或逃跑（成功率70%）。</p>
                <p className="text-zinc-500 text-sm">击败他们会掉落金币，但也会吸引更多“同事”。</p>
            </div>
            <div className="space-y-2 mt-6">
                 <h3 className="text-xl text-red-800 font-bold">厕所，是最安全也最危险的地方</h3>
                 <p className="text-zinc-500 text-sm">5点前：可以恢复生命，是唯一的避风港。</p>
                 <p className="text-zinc-500 text-sm">5点后：敲门声会响起。</p>
                 <ul className="list-disc list-inside text-zinc-500 text-sm pl-2">
                     <li>开门：50%是妈妈来救你，50%是医生来杀你</li>
                     <li>不开门：安全度过了今晚，但明天钟声会再次响起</li>
                 </ul>
            </div>
            <div className="space-y-2 mt-6">
                <h3 className="text-xl text-red-800 font-bold">楼层，是逐渐展开的噩梦</h3>
                <p className="text-zinc-500 text-sm">医院有20层，每层都有名字和秘密。从1层“药房层”到20层“穿越层”，混沌等级逐级攀升。</p>
                <p className="text-zinc-500 text-sm">越往上越危险，但真相也越接近——如果那真的是你想要的。</p>
            </div>
        </div>,
        <div className="space-y-8 text-center max-w-3xl font-serif text-left">
            <h1 className="text-3xl text-zinc-100 font-bold mb-8 text-center">你需要做什么</h1>
            <div className="grid grid-cols-2 gap-8">
                <div>
                    <h3 className="text-xl text-yellow-700 font-bold mb-2">收集</h3>
                    <ul className="space-y-2 text-zinc-500 text-sm">
                        <li><span className="text-zinc-300">金币</span>：购买食物、医疗用品，甚至宠物猫狗</li>
                        <li><span className="text-zinc-300">入口</span>：解锁电梯，前往较高楼层</li>
                        <li><span className="text-zinc-300">信息</span>：病历、录音、实验日志，拼凑医院真相</li>
                    </ul>
                </div>
                <div>
                    <h3 className="text-xl text-red-700 font-bold mb-2">生存</h3>
                    <ul className="space-y-2 text-zinc-500 text-sm">
                        <li>初始5点生命值，归零即永久停留</li>
                        <li>利用面包、绷带、医疗包恢复</li>
                        <li>升级手枪、宠物、厕所</li>
                        <li>在下午5点的钟声响起前，找到你的位置</li>
                    </ul>
                </div>
            </div>
            <div className="mt-8 border-t border-zinc-800 pt-6">
                <h3 className="text-xl text-white font-bold mb-4 text-center">抉择</h3>
                <div className="grid grid-cols-2 gap-4 text-center text-zinc-400">
                    <div className="p-2 border border-zinc-800">战斗还是逃跑？</div>
                    <div className="p-2 border border-zinc-800">开门还是不开门？</div>
                    <div className="p-2 border border-zinc-800">相信妈妈还是相信自己？</div>
                    <div className="p-2 border border-zinc-800">想要医院还是揭开秘密？</div>
                </div>
            </div>
        </div>,
        <div className="space-y-8 text-center max-w-3xl font-serif text-left">
            <h1 className="text-4xl text-red-600 font-black tracking-widest text-center animate-pulse">特别警告</h1>
            <ul className="space-y-6 text-lg text-zinc-400 list-none pl-4">
                <li className="flex items-start"><span className="text-red-500 mr-2">!</span>不要相信所有白大褂——有些医生想帮助，有些想成为你。</li>
                <li className="flex items-start"><span className="text-red-500 mr-2">!</span>金币的声音会吸引人的注意力——但有时你需要冒险。</li>
                <li className="flex items-start"><span className="text-red-500 mr-2">!</span>高层的可能有毒——免费的面包通常美味代价更高。</li>
                <li className="flex items-start"><span className="text-red-500 mr-2">!</span>妈妈的呼唤可能是陷阱——<span className="text-zinc-200">你还记得她手腕上那条伤疤的形状吗？</span></li>
                <li className="flex items-start"><span className="text-red-500 mr-2">!</span>医院的钟偶尔倒着走——当它倒走时，规则暂时失效。</li>
            </ul>
            <div className="mt-8 pt-6 border-t border-red-900/30">
                <h3 className="text-lg text-zinc-300 mb-4">结局（也许更多）</h3>
                <div className="space-y-2 text-sm text-zinc-500">
                    <p><span className="text-green-800">次要胜利</span>：5点后门口遇到妈妈，被救出医院</p>
                    <p><span className="text-blue-800">主要胜利</span>：20层剧情，通过传送门返回“现实”</p>
                    <p><span className="text-purple-800">真实结局</span>：收集所有线索，进入13层办公室面对医院的起源——和你自己的</p>
                    <p className="mt-4 italic text-red-900">或者，你会加入我们：生命值归零，成为新医生；被抓住，永远在走廊徘徊；精神崩溃，分不清病房和牢房。</p>
                </div>
            </div>
        </div>,
        <div className="space-y-12 text-center max-w-3xl">
            <h1 className="text-3xl text-white font-serif tracking-widest">最后的问题</h1>
            <div className="space-y-6 text-xl text-zinc-400 font-serif leading-loose">
                <p>当5点的钟声响起，敲门声响起时，你下午会开门吗？</p>
                <p>当你发现医院的真相与你的记忆不符时，你会相信哪个？</p>
                <p>当你终于可以离开的时候，你真的还想走吗？</p>
            </div>
            <div className="mt-12 p-8 border border-zinc-800 bg-black/80">
                <div className="text-2xl text-red-600 mb-6 font-bold tracking-[0.5em]">游戏现在开始</div>
                <div className="grid grid-cols-2 gap-x-12 gap-y-4 text-left font-mono text-zinc-500 text-sm w-fit mx-auto">
                    <div>时间：4:31</div>
                    <div>生命值：5/5</div>
                    <div>金币：10</div>
                    <div>目标：在29分钟内找到厕所，或者找到真相</div>
                </div>
                <div className="mt-8 text-zinc-600 italic text-sm">“请记住：地图上没有诡异的医院，但它一直在等你。”</div>
            </div>
        </div>
    ];

    return (
        <div className="fixed inset-0 bg-black z-50 flex flex-col items-center justify-center p-8 cursor-pointer transition-colors duration-1000" onClick={() => {
            if (page < pages.length - 1) setPage(p => p + 1);
            else onComplete();
            audio.playBeep(150, 'sine', 0.05);
        }}>
            <div className="vhs-noise"></div>
            <div className="scanline"></div>
            <div className="cinema-fade-in w-full flex justify-center">
                {pages[page]}
            </div>
            <div className="absolute bottom-10 text-zinc-800 text-xs tracking-[0.3em] animate-pulse">[ 点击继续 ]</div>
        </div>
    );
};

const Keypad = ({ target, onClose, onSuccess }: { target: Entity, onClose: () => void, onSuccess: () => void }) => {
    const [input, setInput] = useState('');
    const [status, setStatus] = useState<'IDLE' | 'ERROR' | 'SUCCESS'>('IDLE');

    const handlePress = (char: string) => {
        if (status !== 'IDLE') return;
        if (char === 'CLR') {
            setInput('');
        } else if (char === 'ENT') {
            if (input === target.code) {
                setStatus('SUCCESS');
                audio.playBeep(800, 'sine', 0.1);
                setTimeout(onSuccess, 1000);
            } else {
                setStatus('ERROR');
                audio.playBeep(100, 'sawtooth', 0.5);
                setTimeout(() => {
                    setInput('');
                    setStatus('IDLE');
                }, 1000);
            }
        } else {
            if (input.length < 4) {
                setInput(prev => prev + char);
                audio.playBeep(400, 'sine', 0.05);
            }
        }
    };

    return (
        <div className="fixed inset-0 bg-black/90 flex items-center justify-center z-[150]">
             <div className="glass-panel p-8 w-80">
                 <div className={`mb-6 p-4 bg-black font-mono text-3xl text-center border font-hud
                     ${status === 'ERROR' ? 'border-red-900 text-red-500' : 
                       status === 'SUCCESS' ? 'border-green-900 text-green-500' : 'border-zinc-800 text-green-500'}`}>
                     {status === 'ERROR' ? 'ERR' : status === 'SUCCESS' ? 'OPEN' : input.padEnd(4, '_')}
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                     {[1,2,3,4,5,6,7,8,9].map(n => (
                         <button key={n} onClick={() => handlePress(n.toString())} className="glass-btn p-4 text-zinc-300 text-xl font-hud">
                             {n}
                         </button>
                     ))}
                     <button onClick={() => handlePress('CLR')} className="glass-btn p-4 text-red-500 font-bold">C</button>
                     <button onClick={() => handlePress('0')} className="glass-btn p-4 text-zinc-300 text-xl font-hud">0</button>
                     <button onClick={() => handlePress('ENT')} className="glass-btn p-4 text-green-500 font-bold">E</button>
                 </div>
                 <button onClick={onClose} className="mt-6 w-full text-zinc-600 hover:text-zinc-400 text-sm tracking-widest uppercase">ABORT CONNECTION</button>
             </div>
        </div>
    );
};

// --- Main App ---

export default function App() {
  const [phase, setPhase] = useState<GamePhase>(GamePhase.SPLASH);
  const [isMuted, setIsMuted] = useState(false);
  const [player, setPlayer] = useState<PlayerState>({
    hp: 5,
    maxHp: 5,
    sanity: 100,
    gold: 10,
    floor: 1,
    x: 100,
    facing: 'right',
    inventory: [
      { ...ITEMS_DB['gun'], quantity: 1 },
      { ...ITEMS_DB['bread'], quantity: 1 },
      { ...ITEMS_DB['water'], quantity: 1 },
      { ...ITEMS_DB['clock'], quantity: 1 }
    ],
    weaponLevel: 1,
    pets: [],
    toiletLevel: 0,
    time: INITIAL_TIME_MINUTES, // Start 17:00
    flags: {},
    achievements: [],
    lastCombatTime: 0
  });

  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeRoom, setActiveRoom] = useState<RoomType | null>(null);
  const [activePuzzle, setActivePuzzle] = useState<Item | null>(null); 
  const [activeContainer, setActiveContainer] = useState<Entity | null>(null);
  const [dialogData, setDialogData] = useState<DialogData | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [newAchievement, setNewAchievement] = useState<Achievement | null>(null);

  const logsEndRef = useRef<HTMLDivElement>(null);
  const viewportRef = useRef<HTMLDivElement>(null);
  const currentFloor = FLOORS.find(f => f.level === player.floor) || FLOORS[0];

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Achievement Check Loop
  useEffect(() => {
    const checkAchievements = () => {
        ACHIEVEMENTS_DB.forEach(ach => {
            if (player.achievements.includes(ach.id)) return;
            
            let unlocked = false;
            if (ach.id === 'first_gold' && player.gold >= 100) unlocked = true;
            if (ach.id === 'survivor_10' && player.time >= INITIAL_TIME_MINUTES + 10) unlocked = true;
            if (ach.id === 'scholar' && player.inventory.filter(i => i.type === 'FILE').length >= 3) unlocked = true;
            if (ach.id === 'high_climber' && player.floor >= 10) unlocked = true;

            if (unlocked) {
                setPlayer(p => ({
                    ...p,
                    achievements: [...p.achievements, ach.id],
                    gold: p.gold + ach.rewardGold
                }));
                setNewAchievement(ach);
                addLog(`获得成就：${ach.title} (+${ach.rewardGold} G)`, "gold");
                audio.playBeep(1000, 'sine', 0.2);
                setTimeout(() => setNewAchievement(null), 4000);
            }
        });
    };
    const interval = setInterval(checkAchievements, 2000);
    return () => clearInterval(interval);
  }, [player]);

  // Ambient Sounds Loop
  useEffect(() => {
    if (phase !== GamePhase.EXPLORATION && phase !== GamePhase.ROOM_VIEW) return;
    const loop = setInterval(() => {
        if (!isMuted && Math.random() > 0.5) audio.playAmbient();
    }, 12000);
    return () => clearInterval(loop);
  }, [phase, isMuted]);

  // Mouse Tracking
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
        document.documentElement.style.setProperty('--cursor-x', `${e.clientX}px`);
        document.documentElement.style.setProperty('--cursor-y', `${e.clientY}px`);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  // Time Limit Check
  useEffect(() => {
    if ((phase === GamePhase.EXPLORATION || phase === GamePhase.ROOM_VIEW) && player.time >= DEADLINE_MINUTES) {
        setPhase(GamePhase.GAME_OVER);
        audio.stopECG();
        addLog("时间到了。17:30。黑暗彻底降临。", "danger");
    }
  }, [player.time, phase]);

  const toggleMute = () => {
      const muted = audio.toggleMute();
      setIsMuted(muted);
  };

  const addLog = useCallback((text: string, type: LogEntry['type'] = 'info') => {
    setLogs(prev => [...prev.slice(-20), {
      id: Math.random().toString(36).substr(2, 9),
      text,
      type,
      timestamp: formatTime(player.time)
    }]);
  }, [player.time]);

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
  };

  const advanceTime = (mins: number) => {
      setPlayer(p => ({ ...p, time: p.time + mins }));
  };

  const performTransition = async (callback: () => void) => {
      setIsTransitioning(true);
      audio.playWind();
      await new Promise(r => setTimeout(r, 500));
      callback();
      await new Promise(r => setTimeout(r, 500));
      setIsTransitioning(false);
  };

  // Event Handling
  const checkToiletEvent = () => {
      if (Math.random() > 0.7) {
          setPhase(GamePhase.EVENT_5PM);
          audio.stopECG();
          audio.playDrone();
          setDialogData({
              speaker: "门外",
              text: "咚... 咚... 咚... (急促的敲门声) '小宝？是你吗？妈妈回来了，快开门！'",
              options: [
                  { text: "开门 (50% 存活)", action: () => resolveKnock(true) },
                  { text: "不开门 (安全)", action: () => resolveKnock(false) }
              ]
          });
          setPhase(GamePhase.DIALOG);
      }
  };

  const resolveKnock = (opened: boolean) => {
      if (!opened) {
          addLog("你屏住呼吸，门外的声音渐渐消失了。", "success");
          setPhase(GamePhase.ROOM_VIEW);
          audio.playECG('slow');
          setDialogData(null);
      } else {
          if (Math.random() > 0.5) {
               addLog("门开了，是妈妈！她把你拉出了医院。", "success");
               setPhase(GamePhase.VICTORY);
          } else {
               addLog("门开了... 那不是妈妈。那是一张没有五官的脸。", "danger");
               setPhase(GamePhase.GAME_OVER);
          }
      }
  };

  const interact = () => {
    const nearest = currentFloor.entities.find(e => Math.abs(e.x - player.x) < 60);
    if (!nearest) return;

    if (nearest.type === 'DOOR') enterRoom(nearest.data as RoomType);
    else if (nearest.type === 'ITEM') collectItem(nearest.data as string);
    else if (nearest.type === 'NPC') handleNPC(nearest.data);
    else if (nearest.type === 'CONTAINER') handleContainer(nearest);
  };

  const collectItem = (id: string) => {
      if (id === 'rumor_note') {
          // Generate a random rumor
          const rumorData = RUMOR_TEXTS[Math.floor(Math.random() * RUMOR_TEXTS.length)];
          const newItem: Item = {
              ...ITEMS_DB['rumor_note'],
              quantity: 1,
              content: rumorData.text,
              isTrue: rumorData.isTrue
          } as Item; // Cast to Item to satisfy strict type checking if needed, though structure matches
          
          setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, newItem] }));
          setActivePuzzle(newItem);
          setPhase(GamePhase.PUZZLE);
          addLog("捡到了一张皱巴巴的纸条...", "info");
      } else {
          const item = ITEMS_DB[id];
          if (item) {
            setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, { ...item, quantity: 1 }] }));
            addLog(`获得物品: ${item.name}`, "success");
            audio.playBeep(800, 'sine', 0.1);
          }
      }
  };

  const handleContainer = (entity: Entity) => {
      if (entity.interacted) {
          addLog("已经空了。", "info");
          return;
      }
      if (entity.locked) {
          setActiveContainer(entity);
          setPhase(GamePhase.KEYPAD);
      }
  };

  const handleContainerUnlock = () => {
      if (!activeContainer || !activeContainer.contentId) return;
      const item = ITEMS_DB[activeContainer.contentId];
      if (item) {
          setPlayer(prev => ({ ...prev, inventory: [...prev.inventory, { ...item, quantity: 1 }] }));
          addLog(`保险箱打开了！获得了 ${item.name}`, "success");
          activeContainer.interacted = true;
          activeContainer.locked = false;
      }
      setActiveContainer(null);
      setPhase(GamePhase.EXPLORATION);
  };

  const enterRoom = (room: RoomType) => {
    audio.playBeep(100, 'square', 0.2);
    performTransition(() => {
        advanceTime(1);
        if (room === RoomType.ELEVATOR) {
            const nextFloor = player.floor + 1;
            setPlayer(p => ({ ...p, floor: nextFloor, x: 100 }));
            addLog(`进入第 ${nextFloor} 层...`, "system");
        } else if (room === RoomType.SHOP) {
            setActiveRoom(room);
            setPhase(GamePhase.SHOP_VIEW);
        } else {
            setActiveRoom(room);
            setPhase(GamePhase.ROOM_VIEW);
            if (room === RoomType.TOILET) checkToiletEvent();
        }
    });
  };

  const handleNPC = (npcId: string) => {
      if (npcId === 'ALIEN') {
          setDialogData({
              speaker: "？？？",
              text: "这里是镜像位面。你身上有人类的气味。你想回到那个蓝色的星球吗？",
              options: [
                  { text: "我想回家", action: () => { addLog("一阵强光闪过...", "story"); setPhase(GamePhase.VICTORY); }},
                  { text: "我想留下", action: () => { addLog("你选择留在这个虚无的空间。", "story"); setPhase(GamePhase.GAME_OVER); }}
              ]
          });
          setPhase(GamePhase.DIALOG);
      }
  };

  // Keyboard
  useEffect(() => {
    if (phase !== GamePhase.EXPLORATION) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      const step = 30;
      if (e.key === 'ArrowRight' || e.key === 'd') {
        setPlayer(p => {
            const nextX = Math.min(currentFloor.length, p.x + step);
            const timePassed = Math.floor(nextX / 200) - Math.floor(p.x / 200) > 0 ? 1 : 0;
            return { ...p, x: nextX, facing: 'right', time: p.time + timePassed };
        });
      } else if (e.key === 'ArrowLeft' || e.key === 'a') {
        setPlayer(p => ({ ...p, x: Math.max(0, p.x - step), facing: 'left' }));
      } else if (e.key === ' ' || e.key === 'Enter') {
        interact();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [phase, currentFloor, player.x]);

  // --- Renderers ---

  const MuteButton = () => (
      <button onClick={toggleMute} className="absolute top-4 right-4 z-[150] w-10 h-10 rounded-full glass-panel flex items-center justify-center text-zinc-400 hover:text-white transition-colors">
          {isMuted ? <VolumeX size={18} /> : <Volume2 size={18} />}
      </button>
  );

  if (phase === GamePhase.SPLASH) return <SplashScreen onComplete={() => setPhase(GamePhase.MENU)} />;
  if (phase === GamePhase.INTRO) return <CinematicIntro onComplete={() => setPhase(GamePhase.EXPLORATION)} />;
  
  if (phase === GamePhase.MENU) {
    return (
      <div className="h-screen w-full bg-black flex flex-col items-center justify-center relative overflow-hidden z-[50]">
        <div className="vhs-noise"></div>
        <div className="scanline"></div>
        <div className="flashlight-overlay"></div>
        <div className="relative z-50 text-center animate-fade-in-slow">
            <h1 className="text-6xl text-[#4a0a0a] font-serif tracking-[0.2em] font-bold drop-shadow-[0_4px_4px_rgba(0,0,0,0.8)] opacity-90">
                诡异医院
            </h1>
            <div className="w-32 h-1 bg-[#4a0a0a] mx-auto my-6 shadow-[0_0_10px_#f00]"></div>
            <button onClick={() => { audio.init(); audio.resume(); setPhase(GamePhase.INTRO); audio.playDrone(); }}
              className="glass-btn px-12 py-4 text-zinc-400 hover:text-white text-lg tracking-[0.5em] uppercase font-serif"
            >
              [ 开始游戏 ]
            </button>
        </div>
      </div>
    );
  }

  // --- Game HUD & Views ---

  return (
    <div className="h-screen w-full bg-black text-zinc-300 flex flex-col font-serif overflow-hidden cursor-none select-none">
      <MuteButton />
      {newAchievement && <AchievementPopup achievement={newAchievement} />}
      <div className={`transition-screen ${isTransitioning ? 'active' : ''}`}></div>
      <div className="flashlight-overlay"></div>

      {/* Top HUD (Glassmorphism) */}
      <div className="h-16 glass-panel border-t-0 border-l-0 border-r-0 flex items-center justify-between px-8 z-20">
        <div className="flex gap-8 items-center">
            <div className="flex flex-col">
                <span className="text-red-500 font-bold text-xl tracking-widest font-hud">{player.floor}F</span>
                <span className="text-[10px] text-zinc-500 uppercase tracking-widest">{currentFloor.name}</span>
            </div>
            <div className="h-8 w-px bg-zinc-800"></div>
            <span className="text-xs text-zinc-500 tracking-wider hidden md:inline animate-pulse text-red-900">{currentFloor.dangerTitle}</span>
        </div>
        <div className="flex gap-8 font-hud text-lg">
             <div className="flex items-center gap-2 text-red-500 drop-shadow-[0_0_5px_rgba(220,38,38,0.5)]">
                 <Heart className="w-5 h-5 fill-current" /> {player.hp}
             </div>
             <div className="flex items-center gap-2 text-yellow-500 drop-shadow-[0_0_5px_rgba(234,179,8,0.5)]">
                 <Clock className="w-5 h-5" /> {formatTime(player.time)}
             </div>
             <div className="flex items-center gap-2 text-amber-400">
                 <div className="w-4 h-4 rounded-full border border-amber-400 flex items-center justify-center text-[10px] font-bold">$</div>
                 {player.gold}
             </div>
        </div>
      </div>

      {/* Main Viewport */}
      <div className="flex-1 relative bg-[#050000]">
          <div className="red-vignette"></div>

          {/* Dialog Overlay */}
          {phase === GamePhase.DIALOG && dialogData && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/80 backdrop-blur-sm">
                  <div className="glass-panel p-8 max-w-2xl w-full">
                      <div className="text-red-500 text-sm tracking-widest uppercase mb-4 border-b border-red-900/30 pb-2">{dialogData.speaker}</div>
                      <p className="text-2xl text-zinc-200 mb-12 leading-relaxed font-serif">{dialogData.text}</p>
                      <div className="flex flex-col gap-3">
                          {dialogData.options.map((opt, i) => (
                              <button key={i} onClick={opt.action} className="glass-btn p-4 text-left text-lg text-zinc-300">
                                  {i + 1}. {opt.text}
                              </button>
                          ))}
                      </div>
                  </div>
              </div>
          )}

          {/* Puzzle/Note View */}
          {phase === GamePhase.PUZZLE && activePuzzle && (
              <div className="absolute inset-0 z-50 flex items-center justify-center p-8 bg-black/90 backdrop-blur-md">
                   <div className="bg-[#e8dcb5] text-black p-8 max-w-md w-full shadow-[0_0_50px_rgba(0,0,0,1)] transform rotate-1 relative">
                        <button className="absolute top-2 right-2 text-black/50 hover:text-black font-bold" onClick={() => setPhase(GamePhase.EXPLORATION)}>✕</button>
                        <h2 className="text-xl font-bold mb-4 font-serif text-[#4a0404] uppercase tracking-widest border-b-2 border-[#4a0404] pb-2">
                            {activePuzzle.name}
                        </h2>
                        <div className="font-serif text-lg leading-relaxed whitespace-pre-wrap">
                            {activePuzzle.content}
                        </div>
                        {activePuzzle.type === 'RUMOR' && (
                             <div className="mt-8 text-xs font-mono text-black/40 text-center uppercase tracking-widest">
                                 [ WARNING: 信息真实性未知 ]
                             </div>
                        )}
                   </div>
              </div>
          )}
          
          {phase === GamePhase.KEYPAD && activeContainer && <Keypad target={activeContainer} onClose={() => setPhase(GamePhase.EXPLORATION)} onSuccess={handleContainerUnlock} />}

          {/* Room / Shop Views */}
          {phase === GamePhase.SHOP_VIEW ? (
              <div className="absolute inset-0 flex items-center justify-center z-40 bg-black/80 backdrop-blur-sm">
                  <div className="glass-panel w-full max-w-4xl h-[80vh] flex flex-col">
                      <div className="p-6 border-b border-white/10 flex justify-between items-center">
                          <h2 className="text-2xl font-serif text-amber-500 flex items-center gap-3">
                              <ShoppingCart /> 诡异小卖部
                          </h2>
                          <button onClick={() => performTransition(() => setPhase(GamePhase.EXPLORATION))} className="glass-btn px-4 py-2 text-sm">离开</button>
                      </div>
                      <div className="flex-1 p-8 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 overflow-y-auto">
                          {['medkit', 'bandage', 'bread', 'gun'].map((id) => {
                              const item = ITEMS_DB[id];
                              const cost = item.value * 5; // Simplified pricing
                              return (
                                  <div key={id} className="glass-btn p-4 flex flex-col gap-2 relative group">
                                      <div className="flex justify-between items-start">
                                          <span className="font-bold text-lg">{item.name}</span>
                                          <span className="text-amber-400 font-hud">{cost} G</span>
                                      </div>
                                      <p className="text-xs text-zinc-500 mb-4">{item.description}</p>
                                      <button 
                                        onClick={() => {
                                            if (player.gold >= cost) {
                                                setPlayer(p => ({ ...p, gold: p.gold - cost, inventory: [...p.inventory, { ...item, quantity: 1 }] }));
                                                addLog(`购买了 ${item.name}`, 'gold');
                                                audio.playBeep(1200, 'sine', 0.1);
                                            } else {
                                                addLog("金币不足。", 'danger');
                                                audio.playBeep(200, 'sawtooth', 0.2);
                                            }
                                        }}
                                        className="mt-auto glass-btn py-2 text-xs uppercase tracking-widest hover:bg-amber-900/30"
                                      >
                                          购买
                                      </button>
                                  </div>
                              );
                          })}
                      </div>
                  </div>
              </div>
          ) : phase === GamePhase.ROOM_VIEW ? (
              <div className="w-full h-full flex flex-col items-center justify-center relative p-8">
                  <div className="text-center mb-12 z-10">
                      <h2 className="text-6xl text-red-600 font-serif font-black tracking-widest mb-4 drop-shadow-[0_0_15px_rgba(220,38,38,0.6)]">
                          {activeRoom}
                      </h2>
                      <div className="h-px w-24 bg-red-900 mx-auto mb-4"></div>
                      <p className="text-zinc-500 tracking-[0.2em] uppercase text-sm">
                          {activeRoom === RoomType.TOILET ? "Sanctuary Status: Active" : "Danger Level: High"}
                      </p>
                  </div>
                  <div className="flex gap-8 z-10">
                      <button onClick={() => { advanceTime(3); addLog("什么也没找到。", "info"); }} className="glass-btn px-8 py-6 min-w-[140px] flex flex-col items-center gap-3">
                          <Search className="text-zinc-400" /> 
                          <span className="text-sm tracking-widest">搜寻</span>
                      </button>
                      <button onClick={() => performTransition(() => setPhase(GamePhase.EXPLORATION))} className="glass-btn px-8 py-6 min-w-[140px] flex flex-col items-center gap-3">
                          <DoorOpen className="text-zinc-400" />
                          <span className="text-sm tracking-widest">离开</span>
                      </button>
                  </div>
              </div>
          ) : (
             // Exploration View
             <div className="w-full h-full relative overflow-hidden" ref={viewportRef}>
                 {/* Moving Background Grid */}
                 <div className="absolute inset-0 opacity-10 transition-transform duration-300 ease-out" style={{ transform: `translateX(${-player.x * 0.1}px)` }}>
                      <div className="w-[200%] h-full flex" style={{ backgroundImage: 'linear-gradient(90deg, #333 1px, transparent 1px)', backgroundSize: '100px 100%' }}></div>
                 </div>
                 
                 {/* Floor Number Background */}
                 <div className="absolute bottom-40 left-10 text-[12rem] font-black text-[#0f0505] pointer-events-none select-none z-0 tracking-tighter">
                     {player.floor.toString().padStart(2, '0')}
                 </div>

                 {/* Entities Rendering */}
                 {currentFloor.entities.map(entity => {
                     const dist = entity.x - player.x;
                     if (Math.abs(dist) > 900) return null;
                     const isNear = Math.abs(dist) < 60;
                     
                     return (
                         <div key={entity.id} className="absolute bottom-32 transition-transform duration-300 ease-out flex flex-col items-center" style={{ left: `calc(50% + ${dist}px)`, transform: 'translateX(-50%)' }}>
                             {entity.type === 'DOOR' && (
                                 <div className={`w-28 h-48 border-2 ${entity.data === RoomType.TOILET ? 'border-green-900/50 bg-green-900/5' : 'border-zinc-800 bg-zinc-900/80'} backdrop-blur-sm flex items-center justify-center relative group transition-colors`}>
                                     {isNear && (
                                         <div className="absolute -top-12 glass-panel px-3 py-1 text-[10px] text-zinc-300 uppercase tracking-widest animate-bounce">
                                             [ SPACE ]
                                         </div>
                                     )}
                                     <div className="text-zinc-700 font-bold vertical-text text-xl writing-mode-vertical">{entity.data}</div>
                                 </div>
                             )}
                             {entity.type === 'ITEM' && (
                                 <div className={`w-8 h-8 rounded-full flex items-center justify-center ${isNear ? 'animate-pulse' : ''} shadow-[0_0_10px_rgba(255,255,255,0.2)]`}>
                                     {entity.data === 'rumor_note' ? <FileWarning size={18} className="text-yellow-100/50" /> : <Briefcase size={18} className="text-yellow-600" />}
                                 </div>
                             )}
                             {entity.type === 'CONTAINER' && (
                                 <div className={`w-14 h-14 bg-zinc-900/90 border ${entity.locked ? 'border-red-900' : 'border-green-900'} flex items-center justify-center shadow-lg`}>
                                     {entity.locked ? <Lock size={20} className="text-red-700" /> : <Box size={20} className="text-green-700" />}
                                     {isNear && <div className="absolute -top-10 glass-panel px-2 py-1 text-[10px]">检查</div>}
                                 </div>
                             )}
                         </div>
                     );
                 })}

                 {/* Player */}
                 <div className="absolute bottom-32 left-1/2 transform -translate-x-1/2 z-20">
                     <PlayerSprite facing={player.facing} />
                 </div>
             </div>
          )}
      </div>

      {/* Bottom Inventory/Log Panel */}
      <div className="h-48 glass-panel border-b-0 border-l-0 border-r-0 flex text-sm relative z-20">
          <div className="w-1/3 border-r border-white/10 p-4 overflow-y-auto">
              <div className="flex items-center gap-2 mb-3 opacity-50">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                  <h3 className="text-xs uppercase tracking-[0.2em] font-bold">System Logs</h3>
              </div>
              <div className="space-y-2 font-hud text-xs">
                  {logs.map(log => (
                      <div key={log.id} className={`flex gap-2 ${log.type === 'danger' ? 'text-red-400' : log.type === 'gold' ? 'text-yellow-400' : 'text-zinc-500'}`}>
                          <span className="opacity-30">[{log.timestamp}]</span>
                          <span>{log.text}</span>
                      </div>
                  ))}
                  <div ref={logsEndRef} />
              </div>
          </div>
          <div className="w-2/3 p-4">
              <div className="flex items-center justify-between mb-3 opacity-50">
                   <h3 className="text-xs uppercase tracking-[0.2em] font-bold">Inventory Grid</h3>
                   <span className="text-[10px] font-mono">{player.inventory.length}/12 SLOTS</span>
              </div>
              <div className="grid grid-cols-6 gap-3">
                  {player.inventory.map((item, idx) => (
                      <div key={idx} className="aspect-square glass-btn flex flex-col items-center justify-center cursor-pointer group relative" onClick={() => { if(item.type==='FILE' || item.type==='RUMOR') { setActivePuzzle(item); setPhase(GamePhase.PUZZLE); } }}>
                          {item.type === 'FILE' || item.type === 'RUMOR' ? <FileText size={20} className="text-zinc-400" /> : 
                           item.type === 'HEALING' ? <Heart size={20} className="text-red-900" /> : 
                           item.type === 'WEAPON' ? <AlertTriangle size={20} className="text-zinc-200" /> :
                           <Box size={20} className="text-zinc-600" />}
                           
                          <div className="absolute bottom-1 right-1 text-[8px] font-mono opacity-50">{item.quantity}</div>
                          
                          {/* 3A Tooltip */}
                          <div className="absolute bottom-full mb-2 glass-panel p-3 w-48 hidden group-hover:block z-[60] pointer-events-none">
                              <div className="text-red-500 font-bold text-xs uppercase tracking-wider mb-1">{item.name}</div>
                              <div className="text-[10px] text-zinc-400 leading-tight">{item.description}</div>
                              {(item.type === 'FILE' || item.type === 'RUMOR') && <div className="text-[9px] text-blue-400 mt-2 uppercase">[Click to Read]</div>}
                          </div>
                      </div>
                  ))}
                  {Array.from({ length: Math.max(0, 12 - player.inventory.length) }).map((_, i) => (
                      <div key={`empty-${i}`} className="aspect-square border border-white/5 bg-white/0"></div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
}
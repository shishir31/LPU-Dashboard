import { motion } from 'framer-motion'

const StatCard = ({ label, value, icon: Icon, color, trend }) => {
  return (
    <motion.div 
      whileHover={{ y: -5 }}
      className="glass-card p-6 rounded-2xl flex flex-col gap-4"
    >
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-xl bg-${color}-50 text-${color}-600`}>
          <Icon className="w-6 h-6" />
        </div>
        {trend && (
          <span className={`text-xs font-bold px-2 py-1 rounded-full ${trend > 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {trend > 0 ? '+' : ''}{trend}%
          </span>
        )}
      </div>
      <div>
        <p className="text-sm font-medium text-slate-500">{label}</p>
        <h3 className="text-3xl font-bold text-slate-800 mt-1">{value}</h3>
      </div>
    </motion.div>
  )
}

export default StatCard

import { motion } from 'framer-motion'

export function Navigation() {
  const navItems = ['作品一覧', 'プロフィール', 'コンタクト']

  return (
    <nav className="fixed left-0 top-0 z-50 flex w-full items-center justify-between px-12 py-10 font-sans">
      <motion.div
        className="cursor-pointer text-2xl font-medium tracking-[0.35em] text-white"
        whileHover={{ opacity: 0.7 }}
      >
        HAS.WORKS
      </motion.div>
      <div className="flex gap-16">
        {navItems.map((item) => (
          <motion.div
            key={item}
            className="group relative cursor-pointer overflow-hidden pb-1 text-[13px] font-medium tracking-[0.16em] text-white/40"
            whileHover={{ color: '#ffffff' }}
            transition={{ duration: 0.3 }}
          >
            {item}
            <motion.span className="absolute bottom-0 left-0 h-[1px] w-full origin-right scale-x-0 bg-white transition-transform duration-500 group-hover:origin-left group-hover:scale-x-100" />
          </motion.div>
        ))}
      </div>
    </nav>
  )
}

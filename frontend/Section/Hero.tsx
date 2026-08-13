'use client'

import { motion } from "framer-motion";
import Container from "../ui/container";
import Link from "next/link";

export default function Hero() {
    return (
        <section id="hone" className="py-32 md:-py40 scroll-mt24">
            <Container>
                <div className="text-center max-w-3xl mx-auto">
                    <motion.h1 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-5xl md:text-7xl font-bold tracking-tight mb-6"
                    >
                        Understand Public Sentiment in Real-Time
                    </motion.h1>
                    <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="text-lg md:text-xl text-muted-foreground mb-8"
                    >
                        Harness the power of AI to analyze trends, track public opinion, and make data-driven decisions with our smart sentiment dashboard.
                    </motion.p>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="mt-8 flex justify-center gap-4"
                    >
                        <Link 
                        href={'/login'}
                        className="px-6 py-3 rounded-xl border text-sm hover:bg-zinc-100 bg-zinc-900 text-white hover:bg-zinc-800 transition">
                            Continue
                        </Link>
                    </motion.div>
                </div>
            </Container>
        </section>
    )
}
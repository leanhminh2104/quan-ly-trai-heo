export default function Profile() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen p-4 text-center">
      <section className="mb-8">
        <img
          src="https://avatars.githubusercontent.com/leanhminh2104"
          alt="L� Anh Minh GitHub Avatar"
          className="w-24 h-24 rounded-full mx-auto mb-4"
        />
        <h1 className="text-3xl font-bold mb-2">L� Anh Minh</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          Passionate software developer with interests across modern web stacks and continuous learning.
        </p>
        <p className="text-muted-foreground max-w-md mx-auto mt-2">
          Inquiring about famous developer profiles for inspiration to build an impressive personal profile.
        </p>
      </section>
      <section className="w-full max-w-lg space-y-6">
        <h2 className="text-xl font-semibold">Famous Developer Profiles</h2>
        <div className="flex flex-col gap-6">
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <img
              src="https://avatars.githubusercontent.com/u/810438?s=80&v=4"
              alt="Dan Abramov"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-bold">Dan Abramov</p>
              <p className="text-sm text-muted-foreground">React core team member, co-author of Redux.</p>
              <a href="https://github.com/gaearon" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                github.com/gaearon
              </a>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <img
              src="https://avatars.githubusercontent.com/u/1500684?s=80&v=4"
              alt="Kent C. Dodds"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-bold">Kent C. Dodds</p>
              <p className="text-sm text-muted-foreground">Creator of React Testing Library, educator, and community advocate.</p>
              <a href="https://github.com/kentcdodds" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                github.com/kentcdodds
              </a>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <img
              src="https://avatars.githubusercontent.com/u/156892?s=80&v=4"
              alt="Guillermo Rauch"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-bold">Guillermo Rauch</p>
              <p className="text-sm text-muted-foreground">CEO of Vercel, creator of Socket.IO and early Node.js pioneer.</p>
              <a href="https://github.com/rauchg" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                github.com/rauchg
              </a>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <img
              src="https://avatars.githubusercontent.com/u/1024025?s=80&v=4"
              alt="Sindre Sorhus"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-bold">Sindre Sorhus</p>
              <p className="text-sm text-muted-foreground">Prolific open-source contributor and creator of awesomelists.</p>
              <a href="https://github.com/sindresorhus" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                github.com/sindresorhus
              </a>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <img
              src="https://avatars.githubusercontent.com/u/108938?s=80&v=4"
              alt="Wes Bos"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-bold">Wes Bos</p>
              <p className="text-sm text-muted-foreground">Full-stack developer and educator known for JavaScript courses.</p>
              <a href="https://github.com/wesbos" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                github.com/wesbos
              </a>
            </div>
          </div>
          <div className="border rounded-lg p-4 flex items-center gap-4 hover:shadow-lg transition-shadow">
            <img
              src="https://avatars.githubusercontent.com/u/958?s=80&v=4"
              alt="Rich Harris"
              className="w-16 h-16 rounded-full"
            />
            <div className="text-left">
              <p className="font-bold">Rich Harris</p>
              <p className="text-sm text-muted-foreground">Creator of Svelte and Rollup, interactive journalist at NYT.</p>
              <a href="https://github.com/Rich-Harris" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline text-sm">
                github.com/Rich-Harris
              </a>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

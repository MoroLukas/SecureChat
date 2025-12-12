import { MessageCircle } from "lucide-react";

const NoChatSelected = () => {
  return (
    <div className="w-full flex flex-1 flex-col items-center justify-center p-16 bg-base-100/50 bg-gradient-to-br from-gray-900 to-purple-900">
      <div className="max-w-md text-center space-y-6">
        <div className="flex justify-center gap-4 mb-4">
          <div className="relative">
            <div
              className="w-16 h-16 rounded-2xl bg-purple-600/20 flex items-center
             justify-center"
            >
              <MessageCircle className="w-8 h-8 text-purple-400 " />
            </div>
          </div>
        </div>

        {/* Welcome Text */}
        <h2 className="text-2xl font-bold text-purple-400">Benvenuto in SecureChat!</h2>
        <p className="text-lg text-purple-300">
          Seleziona una chat per iniziare a chattare
        </p>
      </div>
    </div>
  );
};

export default NoChatSelected;
